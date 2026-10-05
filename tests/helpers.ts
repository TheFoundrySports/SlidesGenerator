import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Deck } from "../src/schema/core";
import type { Design } from "../src/schema/design-types";
import { DESIGNS_DIR, ROOT, loadDesigns, readProjectText } from "../src/node/project";

export { ROOT, readProjectText };

export const CATECHISM = "catechism-liturgical";

export const getDesign = async (id: string = CATECHISM): Promise<Design> => {
  const registry = await loadDesigns();
  const design = registry.get(id);
  if (!design) throw new Error(`design ${id} not registered`);
  return design;
};

export const examplePath = (designId: string, name: "minimal" | "full"): string =>
  join(DESIGNS_DIR, designId, "examples", `${name}.deck.json`);

export const readExample = (designId: string, name: "minimal" | "full"): unknown =>
  JSON.parse(readFileSync(examplePath(designId, name), "utf8"));

/** Parses a deck object with the design's schema and fails the test on error. */
export const parseDeck = (design: Design, input: unknown): Deck => design.deckSchema.parse(input);

/** Minimal valid slide factory for the catechism design. */
export const reflection = (id: string, text = "«Antes de que la luz fuera luz, ya eras Tú.»") => ({
  id,
  layout: "reflection" as const,
  label: id,
  text,
});

export const deckOf = (slides: unknown[], extra: Record<string, unknown> = {}) => ({
  id: "t",
  title: "Test",
  lang: "es",
  design: CATECHISM,
  slides,
  ...extra,
});
