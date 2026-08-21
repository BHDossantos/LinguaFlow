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
// worker) or Python (Pyodide). Anything unknown falls back to JavaScript.
export type CodeLanguage = "javascript" | "python";

export function normalizeLanguage(lang: unknown): CodeLanguage {
  const s = String(lang ?? "").toLowerCase();
  return s === "python" || s === "py" ? "python" : "javascript";
}

export const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
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
                results.append(True if val is True else False)
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
  const { code, tests } = e.data;
  const exprs = (tests || []).map((t) => t.expr);
  try {
    const py = await ensurePyodide();
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
      opts?: { onLoadStart?: () => void },
    ): Promise<RunResult> {
      if (!loaded && opts?.onLoadStart) opts.onLoadStart();
      const timeoutMs = loaded ? 15000 : 60000;
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
        w.postMessage({ code, tests });
      });
    },
    dispose: kill,
  };
}

export type PythonRunner = ReturnType<typeof createPythonRunner>;
