---
name: slide-builder
description: Build slide decks as data for SlidesChurch. Writes decks/<slug>/brief.md and deck.json in any registered design, then validates and builds the HTML. Use for "build me a deck", "armame una clase", "make a 10-slide deck on X", "add a slide", "regenerate the deck".
---

# Slide Builder

You produce **data, never HTML**. A deck is a folder:

```
decks/<slug>/
  brief.md      research, intent, sources, speaker notes
  deck.json     validated source of truth: text, images, positions, animations
  assets/       images referenced by deck.json ("assets/foo.jpg")
```

`npm run build <slug>` renders `dist/<slug>/<slug>.html`. Editing a deck = editing `deck.json`, then rebuilding.

## Workflow

1. **Pick the design.** `npm run designs` lists packs. If the user does not say, use the one that fits (church/catechesis → `catechism-liturgical`). If none fits, stop and hand off to `design-author`.
2. **Read the pack's contract** — do not guess fields:
   - `designs/<id>/GUIDE.md` (voice, layout catalog, rhythm, image policy, hard rules).
   - `schemas/<id>.schema.json` (exact fields; regenerate with `npm run schemas`).
   - `designs/<id>/examples/*.deck.json` (one valid slide per layout).
   - `designs/<id>/DESIGN.md` only for visual rationale.
3. **Scaffold:** `npm run new -- <slug> --design <id> --title "…"`.
4. **Write `brief.md` first**: intention, audience and tone, sources, structure table (`# | id | layout | content`), and `## Notas` with one `### <slide-id>` block per slide that needs speaker notes. Facts and quotations come from real sources; never invent scripture or Catechism numbers (use the pack's placeholder convention and tell the user).
5. **Write `deck.json`** from the brief. Set `"design"`, `"lang"`, `"palette"`. Every slide has a stable kebab-case `id` (notes attach to it), a `layout` and a short `label`.
6. **Images**: put files in `assets/`, reference as `"assets/<file>"` with `alt`, `slot`, `fit` and `credit`. Use the pack's image policy.
7. **Validate and fix**: `npm run validate <slug>`. P0 issues block the build and must be fixed. Fix P1 when reasonable; mention P2.
8. **Build**: `npm run build <slug>`; preview with `npm run dev` (gallery at `/`, deck at `/?deck=<slug>`).
9. **Report**: output path, layout sequence, validator result, and a one-line voice verdict. Stop.

## Rules

- Only write `brief.md`, `deck.json` and `assets/` inside `decks/<slug>/`. Do not edit `src/`, `designs/*`, `schemas/*` or `dist/`.
- Never hand-write HTML or CSS for a slide. If a layout is missing, use the pack's closest layout or the core `free` layout; if that is insufficient, ask for a new layout via `design-author`.
- Regenerating a deck: change `deck.json` (or `brief.md` notes) and rebuild. Keep slide `id`s stable.
- Never commit, push or open PRs unless the user asks.
