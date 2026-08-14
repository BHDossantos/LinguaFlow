import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_CHARS = 16000;

// Extract plain text from an uploaded PDF / DOCX / text file, so the study-tools
// generator (spec §13) can build flashcards/quizzes/summaries from a learner's
// own materials. Runs server-side; no third-party upload.
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 10 MB)." }, { status: 413 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  try {
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text ?? "";
      await parser.destroy();
    } else if (name.endsWith(".docx") || file.type.includes("officedocument.wordprocessingml")) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value ?? "";
    } else if (/\.(txt|md|markdown|csv|rtf|text)$/.test(name) || file.type.startsWith("text/")) {
      text = buffer.toString("utf8");
    } else {
      return NextResponse.json({ error: "Unsupported file — use PDF, DOCX, or a text file." }, { status: 415 });
    }
  } catch {
    return NextResponse.json({ error: "Could not read that file — try another." }, { status: 422 });
  }

  text = text.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
  if (text.length < 20) {
    return NextResponse.json({ error: "Not enough readable text in that file." }, { status: 422 });
  }
  return NextResponse.json({ text });
}
