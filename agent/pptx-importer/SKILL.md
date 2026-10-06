---
name: pptx-importer
description: "Trigger: import this pptx, convert this presentation, export to PowerPoint. Turn a .pptx into a deck, or a deck into .pptx."
license: Apache-2.0
metadata:
  author: fran
  version: "2.0"
---

## Activation Contract

Use this skill when the user has a `.pptx` to import, or asks to export a deck to PowerPoint. Deck authoring without a PPTX belongs to `slide-builder`.

## Hard Rules

- Write only `decks/<slug>/`. `npm run build` and `npm run export:pptx` may write `dist/`. Never edit `src/` or `designs/`.
- Never invent text, quotes, or citations that are not in the PPTX. Mark gaps with the pack's placeholder and tell the user.
- Do not trust `--map` field order. It assigns text boxes to string fields by font size, so quotes and citations swap and lists disappear. Fix fields by hand before validating.
- `--force` overwrites `deck.json` and `assets/`. It does not replace an existing `brief.md`.
- Commit, push, or open a PR only when the user asks.

## Decision Gates

| Situation | Action |
| --- | --- |
| First look at an unknown PPTX | Import with no `--map`. Every slide stays `free`. |
| Slide job is obvious (cover, scripture, doctrine) | Re-run with `--map "N:layout,…" --force`, then fix fields. |
| Slide needs `points`, `columns`, or `items` | Edit `deck.json`. `--map` only fills string fields. |
| User wants a PowerPoint of an existing deck | `npm run export:pptx -- <slug>`. Do not import. |

## Execution Steps

1. Ask for the `.pptx` path, slug, and design id (`npm run designs`) when any is missing.
2. Read `designs/<id>/GUIDE.md` and `schemas/<id>.schema.json`.
3. Run `npm run import:pptx -- <file.pptx> <slug> --design <id> [--title] [--map] [--force]`. Images go to `decks/<slug>/assets/`. EMF and WMF are skipped.
4. For every mapped slide, check before validate:
   - Required layout fields hold the matching text, not the largest box.
   - Lists are `points`, `columns`, or `items` arrays. Markers such as `I.` or `1.` are not stray strings.
   - Page counters (`NN / NN`) are absent.
5. Move speaker notes into `brief.md` under `## Notas` / `### <slide-id>`. Keep notes already there.
6. Run `npm run validate <slug>` and `npm run build <slug>`. Fix every P0.

## Output Contract

Return the slide count, layout sequence, skipped images, slides you hand-edited, and the validator result. For an export, return the `.pptx` path and state that it is text-first, not pixel-faithful.

## References

- `designs/<id>/GUIDE.md` — layouts and required fields.
- `docs/architecture.md` — deck and notes flow.
