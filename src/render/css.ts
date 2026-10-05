import type { Design } from "../schema/design-types";

const FALLBACK = { display: "serif", body: "serif", mono: "monospace" } as const;

const quote = (family: string) => (family.includes(",") || family.includes('"') ? family : `"${family}"`);

/** CSS font stacks for the three roles. */
export const fontStacks = (design: Design) => ({
  display: design.fonts.stacks?.display ?? `${quote(design.fonts.display)}, ${FALLBACK.display}`,
  body: design.fonts.stacks?.body ?? `${quote(design.fonts.body)}, ${FALLBACK.body}`,
  mono: design.fonts.stacks?.mono ?? `${quote(design.fonts.mono)}, ${FALLBACK.mono}`,
});

/** `:root` color/font tokens plus one `[data-palette]` block per palette that overrides tokens. */
export const tokensCss = (design: Design): string => {
  const stacks = fontStacks(design);
  const colors = Object.entries(design.tokens.colors)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");
  const root = `:root {\n${colors}\n  --font-display: ${stacks.display};\n  --font-body: ${stacks.body};\n  --font-mono: ${stacks.mono};\n}`;
  const palettes = Object.entries(design.palettes.options)
    .filter(([, overrides]) => Object.keys(overrides).length > 0)
    .map(([name, overrides]) => {
      const body = Object.entries(overrides)
        .map(([token, value]) => `  --${token}: ${value};`)
        .join("\n");
      return `[data-palette="${name}"] {\n${body}\n}`;
    });
  return [root, ...palettes].join("\n\n");
};

/** Every hex color a deck of this design may legitimately contain (tokens + palettes). */
export const allowedHexes = (design: Design): Set<string> => {
  const hexes = new Set<string>();
  const collect = (values: Record<string, string>) => {
    for (const value of Object.values(values)) {
      for (const match of value.match(/#[0-9a-fA-F]{6}\b/g) ?? []) hexes.add(match.toUpperCase());
    }
  };
  collect(design.tokens.colors);
  for (const overrides of Object.values(design.palettes.options)) collect(overrides);
  return hexes;
};
