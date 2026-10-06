---
name: slide-builder
description: "Trigger: build a deck, armame una clase, add a slide, regenerate a deck. Write brief.md and deck.json, then validate and build."
license: Apache-2.0
metadata:
  author: fran
  version: "2.0"
---

## Activation Contract

Use this skill to create, extend, or regenerate a SlidesChurch deck as data. Hand off when the user supplies a `.pptx` or no registered design fits.

## Hard Rules

- Write only `decks/<slug>/brief.md`, `deck.json`, and `assets/`. Commands may write generated `dist/` and `schemas/`. Never edit `src/` or `designs/`, and never hand-write slide HTML or CSS.
- Read `designs/<id>/GUIDE.md` and `schemas/<id>.schema.json` before choosing fields. Voice, motifs, variants, palettes, and budgets live there; do not guess or restate them.
- Never invent scripture, Catechism numbers, or quotations. Use the pack's placeholder and tell the user. Catechism packs use `[Cita pendiente]`.
- Keep slide `id`s stable. If `brief.md` already has `## Notas`, keep every `### <slide-id>` block. Change a block only for a slide the user asked to change.
- Commit, push, or open a PR only when the user asks.

## Decision Gates

| Situation | Action |
| --- | --- |
| User has a `.pptx` | Stop. Hand off to `agent/pptx-importer/SKILL.md`. |
| No design fits | Stop. Hand off to `agent/design-author/SKILL.md`. |
| New slug | `npm run new -- <slug> --design <id> --title "…"`, then write both files. |
| Folder already exists | Do not run `new`. Edit `deck.json`. Preserve ids and `## Notas`. |
| No layout fits | Use the closest pack layout, or core `free`. If that fails, ask for `design-author`. |

## Execution Steps

1. Run `npm run designs`. Church or catechesis defaults to `catechism-liturgical`.
2. Read `designs/<id>/GUIDE.md`, `schemas/<id>.schema.json`, and `designs/<id>/examples/*.deck.json`. Open `DESIGN.md` only for visual rationale.
3. Follow the decision table. `npm run new` fails when the folder exists.
4. Write `brief.md` first for a new deck: intention, audience, tone, sources, a structure table (`# | id | layout | content`), then `## Notas` with one `### <slide-id>` block per slide that needs notes.
5. Write `deck.json`: `design`, `lang`, `palette`. Each slide has a kebab-case `id`, `layout`, and short `label`, plus the layout fields from the schema.
6. Put images in `assets/` and reference `assets/<file>` with `alt`, `slot`, `fit`, and `credit`.
7. Run `npm run validate <slug>`. Fix every P0. Fix P1 when reasonable. Mention P2.
8. Run `npm run build <slug>`. Preview with `npm run dev` (`/?deck=<slug>`).

## Output Contract

Return the HTML path, the layout sequence, the validator result, and a one-line voice verdict. Stop.

## References

- `designs/<id>/GUIDE.md` — voice, layouts, rhythm, images, and hard rules for the chosen pack.
- `schemas/<id>.schema.json` — exact fields. Regenerate with `npm run schemas`.
- `docs/architecture.md` — how a deck becomes HTML.
