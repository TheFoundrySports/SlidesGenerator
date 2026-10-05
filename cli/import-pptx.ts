import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractPptx, isSupportedImage, parseMapArg, toDeck } from "../src/importers/pptx";
import { DECKS_DIR } from "../src/node/project";
import { fail, loadDesigns, parseArgs, rel } from "./lib";

const USAGE =
  'Usage: npm run import:pptx -- <input.pptx> <slug> --design <design-id> [--title "Title"] [--map "1:cover,2:scripture"] [--force]';
const args = parseArgs(process.argv.slice(2), ["design", "title", "map"]);
const [input, slug] = args.positional;
if (!input || !slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(USAGE);
if (!existsSync(input as string)) fail(`File not found: ${input}`);

const registry = await loadDesigns();
const design = registry.get(typeof args.flags.design === "string" ? args.flags.design : "");
if (!design) fail(`${USAGE}\nAvailable designs: ${[...registry.keys()].join(", ") || "(none)"}`);

const dir = join(DECKS_DIR, slug as string);
if (existsSync(dir) && !args.flags.force) fail(`decks/${slug} already exists (use --force to overwrite deck.json and assets)`);

console.error(`Extracting ${input}…`);
const extraction = await extractPptx(readFileSync(input as string));
console.error(`  ${extraction.slides.length} slides, ${extraction.images.length} image(s)`);

const assetsDir = join(dir, "assets");
mkdirSync(assetsDir, { recursive: true });
for (const image of extraction.images) {
  if (isSupportedImage(image.name)) writeFileSync(join(assetsDir, image.name), image.data);
  else console.error(`  ! skipped unsupported image ${image.name}`);
}

const title = typeof args.flags.title === "string" ? args.flags.title : (slug as string);
const map = parseMapArg(typeof args.flags.map === "string" ? args.flags.map : undefined);
const deck = toDeck(extraction, { slug: slug as string, title, design: design!, map });
const parsed = design!.deckSchema.safeParse(deck);

writeFileSync(
  join(dir, "deck.json"),
  JSON.stringify({ $schema: `../../schemas/${design!.id}.schema.json`, ...deck }, null, 2) + "\n",
);
if (!existsSync(join(dir, "brief.md"))) {
  writeFileSync(join(dir, "brief.md"), `# ${title}\n\nImportado desde ${input}.\n\n## Notas\n`);
}

console.log(`✓ ${rel(dir)}/deck.json (${deck.slides.length} slides, design ${design!.id}) + assets/`);
if (!parsed.success) console.log("  ! the draft does not validate yet; run `npm run validate " + slug + "` and fix the listed issues");
console.log(`  Next: refine with the pptx-importer agent or by hand, then \`npm run validate ${slug}\` and \`npm run build ${slug}\`.`);
