import { formatValidation, validateDeck } from "../src/node/validate";
import { fail, loadDesigns, parseArgs, resolveSlugs } from "./lib";

const args = parseArgs(process.argv.slice(2));
const slugs = resolveSlugs(args, "Usage: npm run validate <slug> [...]   |   npm run validate -- --all");
const registry = await loadDesigns();

let blocked = false;
let issueCount = 0;
for (const slug of slugs) {
  const result = validateDeck(slug, registry);
  console.log(formatValidation(result));
  issueCount += result.issues.length + result.schemaErrors.length;
  blocked ||= result.blocked;
}
console.log(`\n${slugs.length} deck(s), ${issueCount} issue(s).`);
if (blocked) fail("P0 issues found: fix them before building.", 1);
