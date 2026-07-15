"use client";
import { useEffect, useRef, useState } from "react";

type Note = {
  id: string;
  text: string;
  updatedAt: string; // ISO
};

const STORAGE_KEY = "noelia-notes-v1";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n: unknown): n is Note =>
        !!n &&
        typeof n === "object" &&
        typeof (n as Note).id === "string" &&
        typeof (n as Note).text === "string" &&
        typeof (n as Note).updatedAt === "string",
    );
  } catch {
    return [];
  }
}

function titleOf(note: Note) {
  const first = note.text.split("\n").find((l) => l.trim().length > 0);
  return first?.trim().slice(0, 80) || "Untitled note";
}

export function NotesClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // localStorage is only available on the client — hydrate after mount.
  useEffect(() => {
    const initial = loadNotes();
    setNotes(initial);
    setSelectedId(initial[0]?.id ?? null);
    setLoaded(true);
  }, []);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const persist = (next: Note[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage full or unavailable — the in-memory copy still works.
      }
    }, 400);
  };

  const addNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      text: "",
      updatedAt: new Date().toISOString(),
    };
    const next = [note, ...notes];
    setNotes(next);
    setSelectedId(note.id);
    persist(next);
  };

  const updateSelected = (text: string) => {
    if (!selectedId) return;
    const next = notes.map((n) =>
      n.id === selectedId ? { ...n, text, updatedAt: new Date().toISOString() } : n,
    );
    setNotes(next);
    persist(next);
  };

  const deleteNote = (id: string) => {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
    persist(next);
  };

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  if (!loaded) {
    return <div className="card text-sm text-ink-500">Loading your notes…</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[240px_1fr]">
      {/* Note list */}
      <div className="space-y-2">
        <button onClick={addNote} className="btn-primary w-full text-sm">
          + New note
        </button>
        {notes.length === 0 ? (
          <p className="card text-sm text-ink-500">
            No notes yet — jot down vocab, class takeaways, anything.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setSelectedId(n.id)}
                  className={`card block w-full text-left transition ${
                    n.id === selectedId
                      ? "border-brand-500/40 ring-1 ring-brand-500/30"
                      : "hover:border-brand-500/30"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{titleOf(n)}</p>
                  <p className="text-[11px] text-ink-500">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editor */}
      {selected ? (
        <div className="card space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-ink-500">
              Saved automatically · last edited {new Date(selected.updatedAt).toLocaleString()}
            </p>
            <button
              onClick={() => deleteNote(selected.id)}
              className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
          <textarea
            value={selected.text}
            onChange={(e) => updateSelected(e.target.value)}
            placeholder="Start typing… the first line becomes the title."
            className="min-h-[320px] w-full resize-y rounded-xl border border-black/5 bg-white p-3 text-sm outline-none focus:border-brand-500/40"
            autoFocus
          />
        </div>
      ) : (
        <div className="card grid place-items-center text-sm text-ink-500">
          Select a note or create a new one.
        </div>
      )}
    </div>
  );
}
