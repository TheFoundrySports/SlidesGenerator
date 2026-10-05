import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DESIGNS_DIR } from "../src/node/project";
import { fail, parseArgs, rel } from "./lib";

const USAGE = 'Usage: npm run new:design -- <design-id> "<Design Name>"';
const args = parseArgs(process.argv.slice(2));
const [id, name] = args.positional;
if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) fail(`${USAGE}\nThe id must be kebab-case.`);
if (!name) fail(USAGE);

const target = join(DESIGNS_DIR, id as string);
if (existsSync(target)) fail(`designs/${id} already exists`);

cpSync(join(DESIGNS_DIR, "_template"), target, { recursive: true });

const replaceInTree = (dir: string): void => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      replaceInTree(path);
      continue;
    }
    const text = readFileSync(path, "utf8");
    if (!text.includes("__ID__") && !text.includes("__NAME__")) continue;
    writeFileSync(path, text.replaceAll("__ID__", id as string).replaceAll("__NAME__", name as string));
  }
};
replaceInTree(target);

console.log(`✓ ${rel(target)} created from the template`);
console.log("  Next: edit design.config.ts, base.css and layouts/, fill GUIDE.md, then `npm run schemas` and `npm run designs`.");
