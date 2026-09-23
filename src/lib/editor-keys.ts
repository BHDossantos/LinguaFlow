// Make a <textarea> feel like a real code editor. Pure DOM + a React setter:
//   • Tab inserts two spaces at the cursor (instead of moving focus away)
//   • Shift+Tab removes up to two leading spaces on the current line (dedent)
//   • Cmd/Ctrl+Enter runs (via the optional onRun callback)
// Used by every `code` lesson editor and the standalone playground so the
// coding experience matches what learners expect from an IDE.
import type { KeyboardEvent } from "react";

export function codeEditorKeyDown(
  e: KeyboardEvent<HTMLTextAreaElement>,
  setValue: (v: string) => void,
  onRun?: () => void,
) {
  const ta = e.currentTarget;

  // Cmd/Ctrl+Enter → run.
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    onRun?.();
    return;
  }

  if (e.key !== "Tab") return;
  e.preventDefault();

  const val = ta.value;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;

  if (e.shiftKey) {
    // Dedent: drop up to two spaces at the start of the cursor's line.
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lead = val.slice(lineStart).match(/^ {1,2}/)?.[0].length ?? 0;
    if (!lead) return;
    const next = val.slice(0, lineStart) + val.slice(lineStart + lead);
    setValue(next);
    const caret = Math.max(lineStart, start - lead);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = caret;
    });
    return;
  }

  // Indent: insert two spaces at the cursor.
  const next = val.slice(0, start) + "  " + val.slice(end);
  setValue(next);
  requestAnimationFrame(() => {
    ta.selectionStart = ta.selectionEnd = start + 2;
  });
}
