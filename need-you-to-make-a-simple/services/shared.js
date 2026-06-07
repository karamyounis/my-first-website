import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

export function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createJsonService({ name, port, routes }) {
  const server = createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const route = routes.find((item) => item.method === req.method && item.pattern.test(url.pathname));

    if (!route) {
      sendJson(res, 404, { error: `${name} route not found` });
      return;
    }

    try {
      const match = url.pathname.match(route.pattern);
      const result = await route.handler({ req, res, url, match });
      if (!res.writableEnded) {
        const status = typeof result.status === "number" ? result.status : result.statusCode ?? 200;
        sendJson(res, status, result.body ?? result);
      }
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
  });

  server.listen(port, () => {
    console.log(`${name} listening on http://localhost:${port}`);
  });
}

export async function proxyJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body.error || `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export async function serveStatic(req, res, rootDir) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  const filePath = join(rootDir, requestedPath);
  const type = contentType(extname(filePath));

  try {
    const file = await readFile(filePath);
    res.writeHead(200, { "Content-Type": type });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function contentType(ext) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml"
  };
  return types[ext] ?? "application/octet-stream";
}
