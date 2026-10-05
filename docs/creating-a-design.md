# Creating a design

A design is a self-contained pack. Adding one never touches the engine.

```bash
npm run new:design -- my-design "My Design"
```

This copies `designs/_template/` to `designs/my-design/` and replaces `__ID__` / `__NAME__`. Then:

1. **`design.config.ts`**: call `defineDesign({ id, name, description, lang, fonts, tokens, css, variants, palettes, shapes, layouts: { core, custom }, animations, rules, limits })`.
   - `tokens.colors` must define `bg`, `surface`, `fg`, `muted`, `border`, `accent`; extras are allowed and become CSS variables.
   - `palettes.options` maps palette names to token overrides; the default is `{}`.
   - `animations.allow` / `budget` constrain what decks may use.
2. **CSS**: `base.css` and `variants/*.css`, scoped to the slide markup. Use tokens (`var(--accent)`) and the standard type scale; no external requests.
3. **Layouts** (`layouts/*.tsx`): one `defineLayout` per archetype.

   ```tsx
   export const statementLayout = defineLayout({
     name: "statement",
     description: "One big sentence.",
     imageSlots: [],
     content: { text: z.string().describe("The sentence") },
     example: { text: "Hello" },
     component: ({ slide }) => <p className="statement">{slide.text}</p>,
   });
   ```

   `content` is a Zod shape; `.describe()` on each field becomes the JSON Schema documentation agents read. Register layouts in `layouts/index.ts`.
4. **Rules** (`rules.ts`): `Rule[]` functions `(ctx) => Issue[]` with severities P0 / P1 / P2 for the pack's hard rules (budgets, voice, forbidden content).
5. **`GUIDE.md`**: what agents read before writing a deck: purpose, audience, voice, layout catalog with fields, rhythm, image policy, hard rules. **`DESIGN.md`**: visual rationale.
6. **Examples**: `examples/minimal.deck.json` and `full.deck.json` (every layout). Tests validate and build them.

Verify:

```bash
npm run schemas      # emits schemas/my-design.schema.json
npm run designs my-design
npm run typecheck && npm test
npm run dev          # inspect the examples in the gallery
```
