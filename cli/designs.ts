import { fail, loadDesigns, parseArgs } from "./lib";

const args = parseArgs(process.argv.slice(2));
const registry = await loadDesigns();

if (args.flags.json) {
  console.log(
    JSON.stringify(
      [...registry.values()].map((design) => ({
        id: design.id,
        name: design.name,
        description: design.description,
        lang: design.lang,
        guide: `${design.dir}/GUIDE.md`,
        schema: `schemas/${design.id}.schema.json`,
        variants: design.variants,
        palettes: Object.keys(design.palettes.options),
        shapes: design.shapes,
        layouts: Object.values(design.layouts.all).map((layout) => ({ name: layout.name, description: layout.description, imageSlots: layout.imageSlots })),
        animations: design.animations,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}

const [wanted] = args.positional;
const designs = wanted ? [registry.get(wanted) ?? fail(`Unknown design "${wanted}". Available: ${[...registry.keys()].join(", ")}`)] : [...registry.values()];
if (designs.length === 0) fail("No designs found in designs/. Create one with: npm run new:design <id>", 1);

for (const design of designs) {
  console.log(`\n${design.id} — ${design.name}`);
  console.log(`  ${design.description}`);
  console.log(`  lang: ${design.lang.join(", ")} · shapes: ${design.shapes.join(", ")}`);
  console.log(`  guide:  ${design.dir}/GUIDE.md`);
  console.log(`  schema: schemas/${design.id}.schema.json`);
  if (wanted) {
    console.log(`  variants: ${design.variants.options.join(", ")} (default ${design.variants.default})`);
    console.log(`  palettes: ${Object.keys(design.palettes.options).join(", ")} (default ${design.palettes.default})`);
    console.log(`  animations: ${design.animations.allow.join(", ")} (default enter ${design.animations.default})`);
    console.log("  layouts:");
    for (const layout of Object.values(design.layouts.all)) {
      const slots = layout.imageSlots.length ? ` [images: ${layout.imageSlots.join("|")}]` : "";
      console.log(`    - ${layout.name}${slots}: ${layout.description}`);
    }
  } else {
    console.log(`  layouts: ${Object.keys(design.layouts.all).join(", ")}`);
  }
}
if (!wanted) console.log("\nDetails: npm run designs <id>   (JSON: npm run designs -- --json)");
