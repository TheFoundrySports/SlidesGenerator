import { exportDeckPdf } from "../src/exporters/pdf";
import { fail, parseArgs, rel, resolveSlugs } from "./lib";

const args = parseArgs(process.argv.slice(2));
const slugs = resolveSlugs(args, "Usage: npm run export:pdf -- <slug> [...] [--offline]   |   npm run export:pdf -- --all");

let failed = false;
for (const slug of slugs) {
  try {
    const exported = await exportDeckPdf(slug, { offline: Boolean(args.flags.offline) });
    console.log(`✓ ${slug} → ${rel(exported.pdfPath)} (${exported.slides} slides, ${(exported.bytes / 1024).toFixed(0)} KB)`);
  } catch (error) {
    console.error(`✗ ${slug}: ${(error as Error).message}`);
    failed = true;
  }
}
if (failed) fail("Some decks were not exported.", 1);
