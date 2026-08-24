// Client-only sandboxed JavaScript runner (spec §12). The learner's code and a
// set of boolean test expressions run together inside a Web Worker — no DOM, no
// network, no access to the page — and a main-thread timeout kills runaways
// (e.g. infinite loops). Shared by the standalone playground and `code` lessons.

export type CodeTest = { label: string; expr: string };

// Each test's `expr` is a JS boolean expression evaluated in the same scope as
// the learner's code, so it can call the functions they defined. A test passes
// only when its expression evaluates strictly to `true`; a thrown error is
// captured and surfaced as the (string) result for that test.
export const WORKER_SRC = `
self.onmessage = (e) => {
  const { code, tests } = e.data;
  const logs = [];
  const sandboxConsole = { log: (...a) => logs.push(a.map(x => {
    try { return typeof x === 'string' ? x : JSON.stringify(x); } catch { return String(x); }
  }).join(' ')) };
  const body =
    'const console = arguments[0];\\n' + code + '\\nreturn [' +
    tests.map(t => '(function(){ try { return (' + t.expr + ') === true; } catch (err) { return String(err && err.message || err); } })()').join(',') +
    '];';
  let results;
  try {
    const fn = new Function(body);
    results = fn(sandboxConsole);
  } catch (err) {
    results = tests.map(() => String(err && err.message || err));
  }
  self.postMessage({ results, logs });
};
`;

// Create a Blob-backed worker URL. Call once (memoize) and revoke when done.
export function createRunnerUrl(): string {
  return URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
}

export type RunResult = { results: (boolean | string)[]; logs: string[] };

// A `code` lesson/challenge names its language; the runner picks JS (a Blob
// worker), Python (Pyodide), or SQL (sql.js). Anything unknown falls back to JS.
export type CodeLanguage = "javascript" | "python" | "sql";

export function normalizeLanguage(lang: unknown): CodeLanguage {
  const s = String(lang ?? "").toLowerCase();
  if (s === "python" || s === "py") return "python";
  if (s === "sql" || s === "sqlite") return "sql";
  return "javascript";
}

export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
  sql: "SQL",
};

// Run `code` against `tests` in a fresh worker and resolve with per-test
// results + captured console output. Never rejects: worker errors and timeouts
// resolve with string placeholders so callers can render them inline.
export function runInSandbox(
  workerUrl: string,
  code: string,
  tests: CodeTest[],
  timeoutMs = 3000,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(workerUrl);
    let timer: ReturnType<typeof setTimeout>;
    const done = (results: (boolean | string)[], logs: string[]) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ results, logs });
    };
    worker.onmessage = (ev) => done(ev.data.results, ev.data.logs ?? []);
    worker.onerror = () => done(tests.map(() => "error"), []);
    timer = setTimeout(() => done(tests.map(() => "timed out (infinite loop?)"), []), timeoutMs);
    worker.postMessage({ code, tests });
  });
}

// ---------------------------------------------------------------------------
// Python support via Pyodide.
//
// Pyodide is a CPython runtime compiled to WebAssembly. It is large (~10 MB on
// first load) and slow to initialize, so — unlike the JS path, which spins up a
// throwaway worker per run — the Python runner keeps ONE worker alive and loads
// Pyodide once, then reuses it for every run. The runtime is fetched from the
// jsDelivr CDN directly by the learner's browser (no server round-trip).
//
// Without cross-origin isolation we cannot interrupt a runaway Python loop, so
// a per-run timeout terminates the worker; the next run transparently reloads.

export const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Python driver: runs the learner's code in a fresh namespace, then evaluates
// each boolean test expression in that same namespace. stdout is captured and
// returned as logs. A test passes only when its expression is exactly True; any
// exception is captured (per test, or for the whole run if the code fails).
const PY_HARNESS = `
import sys, io, json

def _run(user_code, exprs):
    ns = {}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    try:
        try:
            exec(user_code, ns)
        except Exception as e:
            msg = type(e).__name__ + ': ' + str(e)
            return {'results': [msg for _ in exprs], 'logs': buf.getvalue().splitlines()}
        results = []
        for ex in exprs:
            try:
                val = eval(ex, ns)
                # Coerce to a Python bool so numpy/pandas scalar comparisons
                # (which return numpy.bool_, not True) grade correctly. An
                # ambiguous value (e.g. a multi-element array) is flagged, not
                # silently passed.
                try:
                    ok = bool(val)
                except Exception:
                    results.append('test did not return a yes/no value')
                    continue
                results.append(True if ok else False)
            except Exception as e:
                results.append(type(e).__name__ + ': ' + str(e))
        return {'results': results, 'logs': buf.getvalue().splitlines()}
    finally:
        sys.stdout = old
`;

const PY_WORKER_SRC = `
let pyReady = null;
function ensurePyodide() {
  if (!pyReady) {
    importScripts('${PYODIDE_BASE}pyodide.js');
    pyReady = loadPyodide({ indexURL: '${PYODIDE_BASE}' }).then(async (py) => {
      await py.runPythonAsync(${JSON.stringify(PY_HARNESS)});
      return py;
    });
  }
  return pyReady;
}
self.onmessage = async (e) => {
  const { code, tests, packages } = e.data;
  const exprs = (tests || []).map((t) => t.expr);
  try {
    const py = await ensurePyodide();
    if (Array.isArray(packages) && packages.length) {
      // loadPackage is cached by Pyodide, so re-calling per run is cheap after
      // the first download (numpy/pandas ship prebuilt in the distribution).
      await py.loadPackage(packages);
    }
    py.globals.set('USER_CODE', code);
    py.globals.set('EXPRS_JSON', JSON.stringify(exprs));
    const outStr = py.runPython('json.dumps(_run(USER_CODE, json.loads(EXPRS_JSON)))');
    const out = JSON.parse(outStr);
    self.postMessage({ results: out.results, logs: out.logs || [] });
  } catch (err) {
    self.postMessage({ results: exprs.map(() => String((err && err.message) || err)), logs: [] });
  }
};
`;

// A reusable Python runner. Create one per editor, call run() as many times as
// you like, and dispose() when unmounting. The first run() downloads Pyodide;
// pass onLoadStart so the UI can show a one-time "downloading runtime" state.
export function createPythonRunner() {
  let worker: Worker | null = null;
  let url = "";
  let loaded = false;

  function spawn() {
    url = URL.createObjectURL(new Blob([PY_WORKER_SRC], { type: "text/javascript" }));
    worker = new Worker(url);
  }

  function kill() {
    if (worker) worker.terminate();
    if (url) URL.revokeObjectURL(url);
    worker = null;
    url = "";
    loaded = false;
  }

  return {
    hasLoaded: () => loaded,
    // First run needs a generous timeout to allow the ~10 MB download; later
    // runs are fast, so the runtime clamps to a shorter execution budget.
    run(
      code: string,
      tests: CodeTest[],
      opts?: { onLoadStart?: () => void; packages?: string[] },
    ): Promise<RunResult> {
      if (!loaded && opts?.onLoadStart) opts.onLoadStart();
      const pkgs = opts?.packages;
      // First load downloads Pyodide (~10 MB); extra packages (pandas etc.) add
      // a few MB more, so allow more headroom before that first success.
      const timeoutMs = loaded ? 20000 : pkgs && pkgs.length ? 120000 : 60000;
      return new Promise((resolve) => {
        if (!worker) spawn();
        const w = worker!;
        let timer: ReturnType<typeof setTimeout>;
        const finish = (results: (boolean | string)[], logs: string[]) => {
          clearTimeout(timer);
          w.onmessage = null;
          w.onerror = null;
          resolve({ results, logs });
        };
        w.onmessage = (ev: MessageEvent) => {
          loaded = true;
          finish(ev.data.results, ev.data.logs ?? []);
        };
        w.onerror = () => {
          // A hard worker error (e.g. CDN unreachable) — reset so the next run
          // starts clean, and report it against every test.
          kill();
          finish(tests.map(() => "could not start the Python runtime"), []);
        };
        timer = setTimeout(() => {
          // Runaway or a stalled first-load download: kill and reset.
          kill();
          finish(tests.map(() => "timed out (infinite loop or slow first load?)"), []);
        }, timeoutMs);
        w.postMessage({ code, tests, packages: pkgs ?? [] });
      });
    },
    dispose: kill,
  };
}

export type PythonRunner = ReturnType<typeof createPythonRunner>;

// ---------------------------------------------------------------------------
// SQL support via sql.js (SQLite compiled to WebAssembly, ~1.5 MB).
//
// A SQL `code` lesson provides a `schema` (DDL + seed rows) and a reference
// `solution` query. The learner writes a query; we run both against a fresh
// in-memory database and compare result sets. Like the Python runner, one
// worker is kept alive so sql.js loads once and is reused.

export const SQLJS_VERSION = "1.13.0";
const SQLJS_BASE = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;

export type SqlResult = { columns: string[]; values: unknown[][] };

const SQL_WORKER_SRC = `
let sqlReady = null;
function ensureSql() {
  if (!sqlReady) {
    importScripts('${SQLJS_BASE}sql-wasm.js');
    sqlReady = initSqlJs({ locateFile: (f) => '${SQLJS_BASE}' + f });
  }
  return sqlReady;
}
self.onmessage = async (e) => {
  const { schema, query, solution } = e.data;
  try {
    const SQL = await ensureSql();
    const runOn = (sqlText) => {
      const db = new SQL.Database();
      try {
        if (schema) db.run(schema);
        const res = db.exec(sqlText);
        const last = res.length ? res[res.length - 1] : { columns: [], values: [] };
        return { columns: last.columns || [], values: last.values || [] };
      } finally {
        db.close();
      }
    };
    const actual = runOn(query);
    const expected = solution ? runOn(solution) : null;
    self.postMessage({ ok: true, actual, expected });
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err) });
  }
};
`;

export type SqlRunResult =
  | { ok: true; actual: SqlResult; expected: SqlResult | null }
  | { ok: false; error: string };

// Reusable SQL runner. run() executes the learner's query (and, when given, the
// reference solution) against a fresh DB seeded by `schema`. Keeps one worker.
export function createSqlRunner() {
  let worker: Worker | null = null;
  let url = "";
  let loaded = false;

  function spawn() {
    url = URL.createObjectURL(new Blob([SQL_WORKER_SRC], { type: "text/javascript" }));
    worker = new Worker(url);
  }
  function kill() {
    if (worker) worker.terminate();
    if (url) URL.revokeObjectURL(url);
    worker = null; url = ""; loaded = false;
  }

  return {
    hasLoaded: () => loaded,
    run(
      schema: string,
      query: string,
      solution?: string | null,
      opts?: { onLoadStart?: () => void },
    ): Promise<SqlRunResult> {
      if (!loaded && opts?.onLoadStart) opts.onLoadStart();
      const timeoutMs = loaded ? 15000 : 45000;
      return new Promise((resolve) => {
        if (!worker) spawn();
        const w = worker!;
        let timer: ReturnType<typeof setTimeout>;
        const finish = (r: SqlRunResult) => {
          clearTimeout(timer);
          w.onmessage = null; w.onerror = null;
          resolve(r);
        };
        w.onmessage = (ev: MessageEvent) => {
          loaded = true;
          finish(ev.data as SqlRunResult);
        };
        w.onerror = () => { kill(); finish({ ok: false, error: "could not start the SQL engine" }); };
        timer = setTimeout(() => { kill(); finish({ ok: false, error: "timed out (slow first load or heavy query?)" }); }, timeoutMs);
        w.postMessage({ schema, query, solution: solution ?? null });
      });
    },
    dispose: kill,
  };
}

export type SqlRunner = ReturnType<typeof createSqlRunner>;

// Compare two SQL result sets. Column names are ignored (learners may alias);
// only the grid of values matters. Unordered by default (rows compared as a
// multiset); pass ordered=true for lessons that teach ORDER BY.
export function sqlResultsEqual(a: SqlResult, b: SqlResult, ordered = false): boolean {
  const rows = (r: SqlResult) => (r.values ?? []).map((row) => JSON.stringify(row));
  const ra = rows(a);
  const rb = rows(b);
  if (ra.length !== rb.length) return false;
  if (ordered) return ra.every((v, i) => v === rb[i]);
  const sa = [...ra].sort();
  const sb = [...rb].sort();
  return sa.every((v, i) => v === sb[i]);
}
