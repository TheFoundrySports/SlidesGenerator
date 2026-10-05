import { buildDeck, writeDecksIndex, type DeckIndexEntry } from "../src/node/build";
import { formatValidation, validateDeck } from "../src/node/validate";
import { fail, loadDesigns, parseArgs, rel, resolveSlugs } from "./lib";

const args = parseArgs(process.argv.slice(2));
const slugs = resolveSlugs(args, "Usage: npm run build <slug> [...] [--inline] [--offline]   |   npm run build -- --all");
const registry = await loadDesigns();

const entries: DeckIndexEntry[] = [];
let failed = false;
for (const slug of slugs) {
  const result = validateDeck(slug, registry);
  if (result.blocked || !result.loaded) {
    console.log(formatValidation(result));
    console.error(`✗ ${slug}: not built (P0 issues above)`);
    failed = true;
    continue;
  }
  const built = buildDeck(result.loaded, { inline: Boolean(args.flags.inline), offline: Boolean(args.flags.offline) });
  const { deck, design } = result.loaded;
  const warnings = result.issues.filter((issue) => issue.severity === "P1").length;
  console.log(`✓ ${slug} → ${rel(built.htmlPath)} (${deck.slides.length} slides, ${design.id}, ${(built.bytes / 1024).toFixed(0)} KB, ${warnings} warning(s))`);
  console.log("  sequence: " + deck.slides.map((slide) => slide.layout).join(" · "));
  entries.push({ slug, title: deck.title, design: design.id, slides: deck.slides.length, file: `${slug}/${slug}.html` });
}

if (entries.length > 0) console.log(`index → ${rel(writeDecksIndex(entries))}`);
if (failed) fail("Some decks were not built.", 1);
