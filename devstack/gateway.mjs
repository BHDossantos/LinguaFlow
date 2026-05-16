import http from "node:http";

const targets = [
  { prefix: "/auth/v1/", to: { host: "127.0.0.1", port: 9999 } },
  { prefix: "/rest/v1/", to: { host: "127.0.0.1", port: 3001 } },
];

const server = http.createServer((req, res) => {
  const match = targets.find((t) => req.url.startsWith(t.prefix));
  if (!match) {
    res.writeHead(404).end("no upstream");
    return;
  }
  const upstreamPath = "/" + req.url.slice(match.prefix.length);
  const headers = { ...req.headers, host: `${match.to.host}:${match.to.port}` };
  const upstreamReq = http.request(
    { host: match.to.host, port: match.to.port, method: req.method, path: upstreamPath, headers },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstreamReq.on("error", (e) => {
    res.writeHead(502).end(`upstream error: ${e.message}`);
  });
  req.pipe(upstreamReq);
});

server.listen(54321, () => console.log("gateway up on 54321"));
