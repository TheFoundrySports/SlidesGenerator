---
name: design-author
description: "Trigger: create a new design, add a layout, deck style. Create or extend a pack under designs/<id>/."
license: Apache-2.0
metadata:
  author: fran
  version: "2.0"
---

## Activation Contract

Use this skill to create a design pack or add a layout, variant, or rule to one. Writing a deck in an existing design belongs to `slide-builder`.

## Hard Rules

- Write only `designs/<id>/` and the generated `schemas/<id>.schema.json`. Never edit another pack or `src/`. If the engine lacks a capability, report it and stop.
- Folders starting with `_` are templates and are not registered.
- Every layout needs a valid `example`. Tests build all of them.
- Call `.describe()` on every Zod content field. That text becomes the JSON Schema.
- Commit, push, or open a PR only when the user asks.

## Decision Gates

| Situation | Action |
| --- | --- |
| Pack does not exist | `npm run new:design -- <id> "Display name"`, then fill the copy of `designs/_template/`. |
| Pack exists | Edit only that pack. Do not re-scaffold. |
| Need a shared layout | Add its name to `layouts.core`: `text-image`, `image-text`, `image-overlay`, `image-full`, `free`. |
| Need a new archetype | Add `layouts/*.tsx` with `defineLayout` and register it in `layouts.custom`. |

## Execution Steps

1. Lock audience, setting (projected or print), voice, language, palette, fonts, slide archetypes, and hard rules.
2. Scaffold only for a new id.
3. Fill `design.config.ts` with `defineDesign`: `id`, `name`, `description`, `lang`, `fonts`, `tokens` (colors `bg`, `surface`, `fg`, `muted`, `border`, `accent`), `css`, `variants`, `palettes`, `shapes`, `layouts`, `animations`, `rules`, `limits`.
4. Write `tokens.css`, `base.css`, and `variants/*.css`. Scope CSS to slide content. Tokens are `--*` properties.
5. Write `rules.ts` (P0 blocks, P1 warns, P2 informs), `GUIDE.md` (purpose, audience, voice, layout catalog, rhythm, image policy, hard rules), and `examples/minimal.deck.json` plus `examples/full.deck.json` (every layout).
6. Run `npm run schemas`, `npm run validate -- --all`, `npm run typecheck`, and `npm test`. View with `npm run dev`.

## Output Contract

Return the files created or edited, the layout list, the rules, and the validation result.

## References

- `docs/creating-a-design.md` — pack contract.
- `designs/_template/` — scaffold source.
- `designs/catechism-liturgical/` — a complete pack, including motifs.
