// Turn an uploaded file into something the grader can read.
// - images  -> sent to the model as a vision block (handled by the caller)
// - PDFs    -> sent to the model as a native document block (handled by caller)
// - PPTX    -> text is extracted here (the model reads the slide text)

import JSZip from "jszip";

export type FileKind = "image" | "pdf" | "pptx" | "text";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Classify an upload from its mime type and filename.
export function classifyFile(mime: string, name: string): FileKind {
  const n = name.toLowerCase();
  if (IMAGE_TYPES.includes(mime) || /\.(jpe?g|png|webp|gif)$/.test(n)) return "image";
  if (mime === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    n.endsWith(".pptx")
  )
    return "pptx";
  return "text";
}

// Extract readable text from a .pptx (which is a zip of slide XML). We pull the
// text runs (<a:t>...</a:t>) from each slide in order. Good enough to grade a
// text-based deck; embedded images are not rendered.
export async function pptxToText(buffer: ArrayBuffer | Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer as any);
  const slideFiles = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return na - nb;
    });

  const parts: string[] = [];
  let i = 0;
  for (const path of slideFiles) {
    i += 1;
    const xml = await zip.files[path].async("string");
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => decodeXml(m[1]));
    const text = runs.join(" ").replace(/\s+/g, " ").trim();
    if (text) parts.push(`--- Slide ${i} ---\n${text}`);
  }
  return parts.join("\n\n");
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
