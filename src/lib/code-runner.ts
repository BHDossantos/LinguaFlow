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
