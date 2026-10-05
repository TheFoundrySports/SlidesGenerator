import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { handleApiRequest } from "../src/node/notes-store";
import { DIST_DIR } from "../src/node/project";
import { fail, parseArgs } from "./lib";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const args = parseArgs(process.argv.slice(2), ["port"]);
const port = Number(typeof args.flags.port === "string" ? args.flags.port : (args.positional[0] ?? process.env.PORT ?? 8000));
if (!Number.isInteger(port) || port <= 0) fail("Usage: npm run serve [-- --port 8000]");
if (!existsSync(join(DIST_DIR, "presenter", "index.html"))) {
  fail("dist/presenter is missing. Run `npm run build:presenter` (and `npm run build -- --all`) first.", 1);
}

const server = createServer(async (request, response) => {
  if (await handleApiRequest(request, response)) return;

  const pathname = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/");
  if (pathname === "/") {
    response.writeHead(302, { Location: "/presenter/index.html" }).end();
    return;
  }

  const target = normalize(join(DIST_DIR, pathname));
  const insideDist = target === DIST_DIR || target.startsWith(`${DIST_DIR}/`);
  const file = existsSync(target) && statSync(target).isDirectory() ? join(target, "index.html") : target;
  if (!insideDist || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving dist/ on http://127.0.0.1:${port}/`);
  console.log(`  presenter → http://127.0.0.1:${port}/presenter/index.html`);
  console.log("  notes editing → saved to decks/<slug>/brief.md (PUT /api/notes/<slug>)");
  console.log("  Ctrl-C to stop");
});
