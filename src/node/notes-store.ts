import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { notesSidecar, serializeBriefNotes } from "../render/notes";
import { DECKS_DIR, DIST_DIR } from "./project";

export interface NotesRoots {
  decksDir: string;
  distDir: string;
}

export const DEFAULT_ROOTS: NotesRoots = { decksDir: DECKS_DIR, distDir: DIST_DIR };

const SLUG = /^[a-z0-9][a-z0-9_-]*$/i;
const MAX_BODY_BYTES = 256 * 1024;
const LOCAL_HOST = /^(127\.0\.0\.1|localhost)(:\d+)?$/;

export type SaveResult = { ok: true; slides: number } | { ok: false; status: number; error: string };

const writeAtomic = (file: string, contents: string): void => {
  const temp = `${file}.tmp`;
  writeFileSync(temp, contents);
  renameSync(temp, file);
};

/** Rewrites `## Notas` in `decks/<slug>/brief.md` and refreshes `dist/<slug>/<slug>.notes.json`. */
export const saveDeckNotes = (roots: NotesRoots, slug: string, notes: unknown): SaveResult => {
  if (!SLUG.test(slug)) return { ok: false, status: 400, error: "Invalid deck slug" };
  const deckFile = join(roots.decksDir, slug, "deck.json");
  if (!existsSync(deckFile)) return { ok: false, status: 404, error: `Unknown deck "${slug}"` };

  let deck: { id?: unknown; slides?: Array<{ id?: unknown }> };
  try {
    deck = JSON.parse(readFileSync(deckFile, "utf8"));
  } catch {
    return { ok: false, status: 500, error: "deck.json is not valid JSON" };
  }
  const slideIds = (deck.slides ?? []).map((slide) => String(slide.id));

  if (!Array.isArray(notes) || notes.length !== slideIds.length || notes.some((note) => typeof note !== "string")) {
    return { ok: false, status: 400, error: `Expected "slides": string[${slideIds.length}]` };
  }

  const briefFile = join(roots.decksDir, slug, "brief.md");
  const brief = existsSync(briefFile) ? readFileSync(briefFile, "utf8") : "";
  const updated = serializeBriefNotes(brief, slideIds, notes as string[]);
  if (updated !== brief) writeAtomic(briefFile, updated);

  const outDir = join(roots.distDir, slug);
  mkdirSync(outDir, { recursive: true });
  const trimmed = (notes as string[]).map((note) => note.replace(/\r\n?/g, "\n").trim());
  writeAtomic(join(outDir, `${slug}.notes.json`), notesSidecar(typeof deck.id === "string" ? deck.id : slug, trimmed));

  return { ok: true, slides: slideIds.length };
};

const sendJson = (response: ServerResponse, status: number, body: unknown): void => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
};

const readBody = (request: IncomingMessage): Promise<string | null> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      // Keep draining an oversized body so the 413 reply can still be delivered.
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    request.on("end", () => resolve(size > MAX_BODY_BYTES ? null : Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });

/**
 * Browsers let any web page send requests to localhost, so writes need proof that they come from
 * the presenter itself: a local Host header (DNS rebinding), a matching Origin, and a custom
 * header (which forces a CORS preflight that this server never answers).
 */
const isTrustedWrite = (request: IncomingMessage): boolean => {
  const host = request.headers.host ?? "";
  if (!LOCAL_HOST.test(host)) return false;
  const origin = request.headers.origin;
  if (origin !== undefined && origin !== `http://${host}`) return false;
  return request.headers["x-slideschurch"] === "1";
};

/** Handles `/api/*`. Returns false when the request is not an API request. */
export const handleApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  roots: NotesRoots = DEFAULT_ROOTS,
): Promise<boolean> => {
  const pathname = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/");
  if (!pathname.startsWith("/api/")) return false;

  if (pathname === "/api/capabilities" && request.method === "GET") {
    sendJson(response, 200, { notesWrite: true });
    return true;
  }

  const match = pathname.match(/^\/api\/notes\/([^/]+)$/);
  if (!match || request.method !== "PUT") {
    sendJson(response, 404, { error: "Not found" });
    return true;
  }
  if (!isTrustedWrite(request)) {
    sendJson(response, 403, { error: "Forbidden" });
    return true;
  }

  const raw = await readBody(request);
  if (raw === null) {
    sendJson(response, 413, { error: "Payload too large" });
    return true;
  }
  let payload: { slides?: unknown };
  try {
    payload = JSON.parse(raw) as { slides?: unknown };
  } catch {
    sendJson(response, 400, { error: "Body must be JSON" });
    return true;
  }

  const result = saveDeckNotes(roots, match[1] as string, payload.slides);
  if (result.ok) sendJson(response, 200, result);
  else sendJson(response, result.status, { error: result.error });
  return true;
};
