import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DECKS_DIR } from "../src/node/project";
import { fail, loadDesigns, parseArgs, rel } from "./lib";

const USAGE = 'Usage: npm run new -- <slug> --design <design-id> [--title "Deck title"]';
const args = parseArgs(process.argv.slice(2), ["design", "title"]);
const slug = args.positional[0];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(`${USAGE}\nThe slug must be kebab-case.`);

const registry = await loadDesigns();
const designId = typeof args.flags.design === "string" ? args.flags.design : "";
const design = registry.get(designId);
if (!design) fail(`${USAGE}\nAvailable designs: ${[...registry.keys()].join(", ") || "(none)"}`);

const dir = join(DECKS_DIR, slug as string);
if (existsSync(dir)) fail(`decks/${slug} already exists`);

const title = typeof args.flags.title === "string" ? args.flags.title : (slug as string);
const firstLayout = Object.values(design!.layouts.all)[0];
mkdirSync(join(dir, "assets"), { recursive: true });

const deck = {
  $schema: `../../schemas/${design!.id}.schema.json`,
  id: slug,
  title,
  lang: design!.lang[0],
  design: design!.id,
  slides: [
    {
      id: "slide-1",
      layout: firstLayout?.name ?? "free",
      label: "Slide 1",
      ...(firstLayout?.example ?? {}),
    },
  ],
};
writeFileSync(join(dir, "deck.json"), JSON.stringify(deck, null, 2) + "\n");
writeFileSync(
  join(dir, "brief.md"),
  `# ${title}\n\n## Intención\n\n## Audiencia y tono\n\n## Fuentes\n\n## Estructura\n\n## Notas\n\nUn bloque \`### <id-de-diapositiva>\` por diapositiva.\n`,
);

console.log(`✓ ${rel(dir)}/deck.json and brief.md (design ${design!.id})`);
console.log(`  Next: read designs/${design!.id}/GUIDE.md, edit deck.json, then \`npm run validate ${slug}\`.`);
