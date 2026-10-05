import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exportPptx } from "../src/exporters/pptx";
import { parseBriefNotes } from "../src/render/notes";
import { DIST_DIR, deckDir, loadDeck } from "../src/node/project";
import { fail, loadDesigns, parseArgs, rel, resolveSlugs } from "./lib";

const args = parseArgs(process.argv.slice(2));
const slugs = resolveSlugs(args, "Usage: npm run export:pptx -- <slug> [...]   |   npm run export:pptx -- --all");
const registry = await loadDesigns();

let failed = false;
for (const slug of slugs) {
  const loaded = loadDeck(slug, registry);
  if (!loaded.ok) {
    console.error(`✗ ${slug}: ${loaded.errors.join("; ")}`);
    failed = true;
    continue;
  }
  const { deck, design, brief } = loaded.value;
  const notes = brief ? parseBriefNotes(brief, deck.slides.map((slide) => slide.id)).notes : undefined;
  const buffer = await exportPptx(deck, design, { assetsRoot: deckDir(slug), notes });
  const outDir = join(DIST_DIR, slug);
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${slug}.pptx`);
  writeFileSync(file, buffer);
  console.log(`✓ ${slug} → ${rel(file)} (${deck.slides.length} slides, ${(buffer.length / 1024).toFixed(0)} KB)`);
}
if (failed) fail("Some decks were not exported.", 1);
