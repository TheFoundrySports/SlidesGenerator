import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { toJSONSchema } from "zod";
import { ROOT } from "../src/node/project";
import { loadDesigns, rel } from "./lib";

const registry = await loadDesigns();
mkdirSync(join(ROOT, "schemas"), { recursive: true });

for (const design of registry.values()) {
  const schema = toJSONSchema(design.deckSchema as never, { io: "input", unrepresentable: "any" });
  const withMeta = { $id: `${design.id}.schema.json`, title: `${design.name} deck`, description: design.description, ...schema };
  const path = join(ROOT, "schemas", `${design.id}.schema.json`);
  writeFileSync(path, JSON.stringify(withMeta, null, 2) + "\n");
  console.log(`✓ ${rel(path)}`);
}
