"use client";
import { useRef, useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { submitAssignment } from "@/app/assignments/actions";

type Props = {
  assignmentId: string;
  kind: string;
  defaultText: string | null;
  hasExisting: boolean;
};

export function SubmitForm({ assignmentId, kind, defaultText, hasExisting }: Props) {
  const [text, setText] = useState(defaultText ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function record() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);

        if (kind === "speaking" && typeof window !== "undefined") {
          const SR =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SR && !text) {
            const r = new SR();
            r.lang = "en-US";
            r.continuous = true;
            r.interimResults = false;
            let transcript = "";
            r.onresult = (e: any) => {
              for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) transcript += e.results[i][0].transcript + " ";
              }
              setText(transcript.trim());
            };
            try { r.start(); setTimeout(() => r.stop(), 500); } catch {}
          }
        }
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch (e: any) {
      setError(e?.message ?? "Could not access microphone");
    }
  }

  async function uploadAttachment(): Promise<string | null> {
    if (!file && !audioBlob) return null;
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("not signed in");

    const blob = file ?? audioBlob!;
    const ext = file
      ? (file.name.split(".").pop() ?? "bin")
      : "webm";
    const filename = `${Date.now()}.${ext}`;
    const path = `${user.id}/${assignmentId}/${filename}`;

    const { error } = await supabase.storage
      .from("submissions")
      .upload(path, blob, {
        contentType: file?.type ?? "audio/webm",
        upsert: true,
      });
    if (error) throw new Error(error.message);
    return path;
  }

  function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const filePath = await uploadAttachment();
        await submitAssignment({ assignmentId, text, filePath });
      } catch (err: any) {
        setError(err?.message ?? "Submission failed");
      }
    });
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">
          {kind === "math" ? "Show your work" : kind === "speaking" ? "Transcript" : "Your response"}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={kind === "speaking" ? 4 : 10}
          minLength={1}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2"
          placeholder={
            kind === "speaking"
              ? "Optional transcript of what you said (we'll auto-fill from recording when possible)"
              : "Write here…"
          }
        />
      </label>

      {(kind === "speaking" || kind === "project") && (
        <div className="card flex items-center gap-3">
          <button
            type="button"
            onClick={record}
            className={recording ? "btn-primary" : "btn-ghost"}
          >
            {recording ? "■ Stop" : "🎙️ Record"}
          </button>
          <div className="flex-1 text-xs text-ink-500">
            {audioBlob ? `Audio ready (${Math.round(audioBlob.size / 1024)} KB)` : "Tap record to capture your answer."}
          </div>
        </div>
      )}

      <label className="card block cursor-pointer">
        <span className="text-sm font-medium">Attach a file (optional)</span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
        {file && <span className="text-xs text-ink-500">{file.name}</span>}
      </label>

      <button
        type="submit"
        disabled={pending || (!text.trim() && !file && !audioBlob)}
        className="btn-primary w-full"
      >
        {pending ? "Submitting…" : hasExisting ? "Resubmit" : "Submit for grading"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
