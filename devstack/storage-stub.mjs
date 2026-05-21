// Minimal stand-in for supabase/storage-api.
//
// Used by devstack/setup.sh ONLY when the real supabase/storage-api image
// cannot be pulled (e.g. Docker Hub rate limit). It implements the exact
// subset of the storage HTTP protocol that @supabase/storage-js v2 uses in
// this app: multipart object upload, signed-URL minting, and signed-URL GET.
//
// It deliberately does NOT enforce auth or RLS — it exists to exercise the
// app's own upload code path (SubmitForm -> upload -> /api/uploads/sign-get),
// not to validate Supabase's storage security. The real container does that.
import http from "node:http";
import { mkdirSync, createWriteStream, existsSync, createReadStream } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const ROOT = "/tmp/lf_storage";
mkdirSync(ROOT, { recursive: true });

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(payload);
}

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean); // e.g. object,submissions,uid,...

    // POST /object/sign/{bucket}/{path...}  -> mint a signed URL
    if (req.method === "POST" && parts[0] === "object" && parts[1] === "sign") {
      const rest = parts.slice(2).join("/"); // bucket/path...
      const token = randomUUID();
      return send(res, 200, { signedURL: `/object/sign/${rest}?token=${token}` });
    }

    // GET /object/sign/{bucket}/{path...}?token=...  -> serve the stored file
    if (req.method === "GET" && parts[0] === "object" && parts[1] === "sign") {
      const rel = parts.slice(2).join("/");
      const file = path.join(ROOT, rel);
      if (!existsSync(file)) return send(res, 404, { message: "Object not found" });
      res.writeHead(200, { "content-type": "application/octet-stream" });
      return createReadStream(file).pipe(res);
    }

    // POST/PUT /object/{bucket}/{path...}  -> store an uploaded object
    if ((req.method === "POST" || req.method === "PUT") && parts[0] === "object") {
      const rel = parts.slice(1).join("/"); // bucket/path...
      const dest = path.join(ROOT, rel);
      mkdirSync(path.dirname(dest), { recursive: true });

      const ct = req.headers["content-type"] || "";
      const raw = await readRaw(req);
      let fileBytes = raw;
      if (ct.includes("multipart/form-data")) {
        // Let undici's Response parse the multipart body for us.
        const form = await new Response(raw, { headers: { "content-type": ct } }).formData();
        const blob = form.get("") || [...form.values()].find((v) => typeof v !== "string");
        if (blob && typeof blob.arrayBuffer === "function") {
          fileBytes = Buffer.from(await blob.arrayBuffer());
        }
      }
      await new Promise((ok, no) => {
        const ws = createWriteStream(dest);
        ws.on("finish", ok);
        ws.on("error", no);
        ws.end(fileBytes);
      });
      return send(res, 200, { Id: randomUUID(), Key: rel });
    }

    // GET /object/authenticated/{bucket}/{path} or /object/{bucket}/{path}
    if (req.method === "GET" && parts[0] === "object") {
      const rel = parts.slice(parts[1] === "authenticated" ? 2 : 1).join("/");
      const file = path.join(ROOT, rel);
      if (!existsSync(file)) return send(res, 404, { message: "Object not found" });
      res.writeHead(200, { "content-type": "application/octet-stream" });
      return createReadStream(file).pipe(res);
    }

    send(res, 404, { message: `no storage-stub route for ${req.method} ${url.pathname}` });
  } catch (e) {
    send(res, 500, { message: String(e?.message ?? e) });
  }
});

server.listen(5000, () => console.log("storage-stub up on 5000"));
