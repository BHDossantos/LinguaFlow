// Host-side reverse proxy that imitates the Supabase URL shape supabase-js
// expects: /auth/v1/* -> gotrue, /rest/v1/* -> postgrest, /storage/v1/* ->
// storage. It also injects CORS headers (the real Supabase setup does this in
// its kong gateway) so browser-side supabase-js calls aren't blocked.
import http from "node:http";

const targets = [
  { prefix: "/auth/v1/", to: { host: "127.0.0.1", port: 9999 } },
  { prefix: "/rest/v1/", to: { host: "127.0.0.1", port: 3001 } },
  { prefix: "/storage/v1/", to: { host: "127.0.0.1", port: 5000 } },
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers":
    "authorization,apikey,content-type,x-client-info,x-upsert,x-supabase-api-version,range,prefer,accept-profile,content-profile",
  "access-control-expose-headers": "content-range,content-length,range",
  "access-control-max-age": "86400",
};

const server = http.createServer((req, res) => {
  // Answer CORS preflight directly.
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const match = targets.find((t) => req.url.startsWith(t.prefix));
  if (!match) {
    res.writeHead(404, CORS).end("no upstream");
    return;
  }
  const upstreamPath = "/" + req.url.slice(match.prefix.length);
  const headers = { ...req.headers, host: `${match.to.host}:${match.to.port}` };
  const upstreamReq = http.request(
    { host: match.to.host, port: match.to.port, method: req.method, path: upstreamPath, headers },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, { ...upstreamRes.headers, ...CORS });
      upstreamRes.pipe(res);
    },
  );
  upstreamReq.on("error", (e) => {
    res.writeHead(502, CORS).end(`upstream error: ${e.message}`);
  });
  req.pipe(upstreamReq);
});

server.listen(54321, () => console.log("gateway up on 54321"));
