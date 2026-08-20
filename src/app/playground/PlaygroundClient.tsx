"use client";
import { useEffect, useMemo, useState } from "react";
import { createRunnerUrl, runInSandbox, type CodeTest } from "@/lib/code-runner";

type Test = CodeTest;
type Challenge = { id: string; title: string; prompt: string; starter: string; tests: Test[] };

// Each test's `expr` is a JS boolean expression evaluated in the same scope as
// the learner's code (so it can call the function they defined).
const CHALLENGES: Challenge[] = [
  {
    id: "add",
    title: "Add two numbers",
    prompt: "Write add(a, b) that returns their sum.",
    starter: "function add(a, b) {\n  // your code here\n}\n",
    tests: [
      { label: "add(2, 3) === 5", expr: "add(2,3) === 5" },
      { label: "add(-1, 1) === 0", expr: "add(-1,1) === 0" },
      { label: "add(0, 0) === 0", expr: "add(0,0) === 0" },
    ],
  },
  {
    id: "reverse",
    title: "Reverse a string",
    prompt: "Write reverse(s) that returns the string reversed.",
    starter: "function reverse(s) {\n  // your code here\n}\n",
    tests: [
      { label: 'reverse("abc") === "cba"', expr: 'reverse("abc") === "cba"' },
      { label: 'reverse("") === ""', expr: 'reverse("") === ""' },
      { label: 'reverse("noelia") === "aileon"', expr: 'reverse("noelia") === "aileon"' },
    ],
  },
  {
    id: "isprime",
    title: "Is it prime?",
    prompt: "Write isPrime(n) that returns true if n is a prime number.",
    starter: "function isPrime(n) {\n  // your code here\n}\n",
    tests: [
      { label: "isPrime(2) === true", expr: "isPrime(2) === true" },
      { label: "isPrime(15) === false", expr: "isPrime(15) === false" },
      { label: "isPrime(17) === true", expr: "isPrime(17) === true" },
      { label: "isPrime(1) === false", expr: "isPrime(1) === false" },
    ],
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    prompt: "Write fizzbuzz(n): 'Fizz' if divisible by 3, 'Buzz' by 5, 'FizzBuzz' by both, else the number as a string.",
    starter: "function fizzbuzz(n) {\n  // your code here\n}\n",
    tests: [
      { label: 'fizzbuzz(3) === "Fizz"', expr: 'fizzbuzz(3) === "Fizz"' },
      { label: 'fizzbuzz(5) === "Buzz"', expr: 'fizzbuzz(5) === "Buzz"' },
      { label: 'fizzbuzz(15) === "FizzBuzz"', expr: 'fizzbuzz(15) === "FizzBuzz"' },
      { label: 'fizzbuzz(7) === "7"', expr: 'fizzbuzz(7) === "7"' },
    ],
  },
];

export function PlaygroundClient() {
  const [idx, setIdx] = useState(0);
  const ch = CHALLENGES[idx];
  const [code, setCode] = useState(ch.starter);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<(boolean | string)[] | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const workerUrl = useMemo(
    () => (typeof window !== "undefined" ? createRunnerUrl() : ""),
    [],
  );
  useEffect(() => () => { if (workerUrl) URL.revokeObjectURL(workerUrl); }, [workerUrl]);

  function selectChallenge(n: number) {
    setIdx(n);
    setCode(CHALLENGES[n].starter);
    setResults(null);
    setLogs([]);
  }

  async function run() {
    if (running || !workerUrl) return;
    setRunning(true); setResults(null); setLogs([]);
    const { results: res, logs: lg } = await runInSandbox(workerUrl, code, ch.tests);
    setResults(res);
    setLogs(lg);
    setRunning(false);
  }

  const allPass = results !== null && results.every((r) => r === true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHALLENGES.map((c, n) => (
          <button
            key={c.id}
            onClick={() => selectChallenge(n)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              n === idx ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white text-ink-700"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="card">
        <p className="font-semibold">{ch.title}</p>
        <p className="mt-0.5 text-sm text-ink-500">{ch.prompt}</p>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={10}
        className="w-full rounded-xl border border-black/10 bg-[#0e1022] p-3 font-mono text-sm text-white"
        aria-label="Code editor"
      />

      <div className="flex items-center gap-2">
        <button onClick={run} disabled={running} className="btn-primary px-5 py-2 text-sm">
          {running ? "Running…" : "▶ Run & check"}
        </button>
        <button onClick={() => setCode(ch.starter)} className="btn-ghost px-4 py-2 text-sm">Reset</button>
        {allPass && <span className="text-sm font-semibold text-green-600">✓ All tests passed!</span>}
      </div>

      {results && (
        <div className="card space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Tests</p>
          {ch.tests.map((t, i) => {
            const r = results[i];
            const ok = r === true;
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span>{ok ? "✅" : "❌"}</span>
                <span className="font-mono text-xs">{t.label}</span>
                {typeof r === "string" && <span className="text-xs text-red-600">— {r}</span>}
              </div>
            );
          })}
        </div>
      )}

      {logs.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Console</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-ink-700">{logs.join("\n")}</pre>
        </div>
      )}
    </div>
  );
}
