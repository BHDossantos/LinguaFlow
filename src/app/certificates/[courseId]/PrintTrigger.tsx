"use client";

// Print dialog doubles as save-to-PDF on every platform.
export function PrintTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary w-full print:hidden"
    >
      Print / save as PDF
    </button>
  );
}
