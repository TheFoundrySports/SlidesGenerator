---
name: design-author
description: Create or extend a SlidesChurch design pack (designs/<id>/) with tokens, layouts, variants, lint rules, GUIDE.md and examples. Use for "create a new design for X", "add a layout to <design>", "a deck style for Y".
---

# Design author

A design is a self-contained pack under `designs/<id>/`. The engine never changes when a design is added. Full reference: `docs/creating-a-design.md`.

## Workflow

1. **Interview** (or derive from the request): audience, setting (projected / print), voice and language, palette, fonts, what archetypes of slides it needs, hard rules (what must never appear).
2. **Scaffold**: `npm run new:design -- <id> "Display name"`. This copies `designs/_template/` and replaces placeholders.
3. **Write the pack**:
   - `design.config.ts`: `defineDesign({ id, name, description, lang, fonts, tokens, css, variants, palettes, shapes, layouts: { core, custom }, animations, rules, limits })`.
   - `tokens.css` / `base.css` / `variants/*.css`: CSS only, scoped to `.slide` content; tokens as `--*` custom properties.
   - `layouts/*.tsx`: one file per archetype with `defineLayout({ name, description, imageSlots, content, example, component })`. `content` is a Zod shape (`.describe()` every field: it becomes the JSON Schema documentation).
   - `rules.ts`: lint rules for the pack's hard rules (P0 blocks, P1 warns, P2 informs).
   - `GUIDE.md`: agent-facing authoring guide (purpose, audience, voice, layout catalog with fields, rhythm, image policy, hard rules).
   - `examples/minimal.deck.json` and `full.deck.json` (every layout) plus any assets.
4. **Verify**: `npm run schemas`, `npm run validate -- --all`, `npm run typecheck`, `npm test` (builds every example). View in `npm run dev`.
5. Report: files created, layout list, rules, validation results.

## Rules

- Write only in `designs/<id>/` and `schemas/<id>.schema.json` (generated). Never edit another pack or the engine (`src/`); if the engine lacks a capability, report it.
- Folders starting with `_` are templates and are not registered.
- Every layout needs a valid `example`; tests build all of them.
- Never commit, push or open PRs.
