import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handleApiRequest, saveDeckNotes, type NotesRoots } from "../src/node/notes-store";

let root: string;
let roots: NotesRoots;
let server: Server;
let base: string;

const BRIEF = "# Demo\n\n## Notas\n\n### a\n\nuno\n\n## Fin\n\nfin\n";
const briefPath = () => join(roots.decksDir, "demo", "brief.md");
const sidecarPath = () => join(roots.distDir, "demo", "demo.notes.json");

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "slideschurch-notes-"));
  roots = { decksDir: join(root, "decks"), distDir: join(root, "dist") };
  mkdirSync(join(roots.decksDir, "demo"), { recursive: true });
  writeFileSync(join(roots.decksDir, "demo", "deck.json"), JSON.stringify({ id: "demo", slides: [{ id: "a" }, { id: "b" }] }));
  writeFileSync(briefPath(), BRIEF);

  server = createServer(async (request, response) => {
    if (!(await handleApiRequest(request, response, roots))) response.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  rmSync(root, { recursive: true, force: true });
});

const put = (path: string, body: unknown, headers: Record<string, string> = { "X-SlidesChurch": "1" }) =>
  fetch(`${base}${path}`, { method: "PUT", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

describe("saveDeckNotes", () => {
  it("rejects slugs that could leave the decks folder", () => {
    expect(saveDeckNotes(roots, "../etc", ["x"])).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects unknown decks and wrong payload shapes", () => {
    expect(saveDeckNotes(roots, "nope", [])).toMatchObject({ ok: false, status: 404 });
    expect(saveDeckNotes(roots, "demo", ["solo una"])).toMatchObject({ ok: false, status: 400 });
    expect(saveDeckNotes(roots, "demo", ["a", 2])).toMatchObject({ ok: false, status: 400 });
  });
});

describe("notes API", () => {
  it("advertises write support", async () => {
    expect(await (await fetch(`${base}/api/capabilities`)).json()).toMatchObject({ notesWrite: true });
  });

  it("writes brief.md and the sidecar, leaving other sections alone", async () => {
    const response = await put("/api/notes/demo", { slides: ["uno **editado**", "dos"] });
    expect(response.status).toBe(200);
    expect(readFileSync(briefPath(), "utf8")).toBe(
      "# Demo\n\n## Notas\n\n### a\n\nuno **editado**\n\n### b\n\ndos\n\n## Fin\n\nfin\n",
    );
    expect(JSON.parse(readFileSync(sidecarPath(), "utf8"))).toEqual({ deck: "demo", slides: ["uno **editado**", "dos"] });
  });

  it("refuses writes without the custom header or from another origin", async () => {
    expect((await put("/api/notes/demo", { slides: ["x", "y"] }, {})).status).toBe(403);
    expect((await put("/api/notes/demo", { slides: ["x", "y"] }, { "X-SlidesChurch": "1", Origin: "https://evil.example" })).status).toBe(403);
  });

  it("validates the body", async () => {
    expect((await put("/api/notes/demo", "no json")).status).toBe(400);
    expect((await put("/api/notes/demo", { slides: ["x"] })).status).toBe(400);
    expect((await put("/api/notes/demo", { slides: ["x".repeat(300_000), "y"] })).status).toBe(413);
  });

  it("refuses a PDF download that does not come from the presenter", async () => {
    expect((await fetch(`${base}/api/pdf/confirmacion-dios-padre`)).status).toBe(403);
  });

  it("reports an unknown deck instead of printing", async () => {
    const response = await fetch(`${base}/api/pdf/no-such-deck`, { headers: { "X-SlidesChurch": "1" } });
    expect(response.status).toBe(404);
  });

  it("ignores non-API paths", async () => {
    expect((await fetch(`${base}/presenter/index.html`)).status).toBe(404);
  });
});
