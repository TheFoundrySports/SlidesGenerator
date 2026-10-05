---
name: pptx-importer
description: Convert a PowerPoint (.pptx) into a SlidesChurch deck (deck.json + brief.md + assets) in a chosen design, and export decks back to .pptx. Use for "import this pptx", "convert this presentation", "export the deck to PowerPoint".
---

# PPTX importer / exporter

## Import: `.pptx` → deck

```bash
npm run import:pptx -- <file.pptx> <slug> --design <design-id> [--title "…"] [--map "1:cover,2:scripture,3:doctrine"] [--force]
```

What it does: reads text with position, size and style, and images from each slide. Without `--map`, it keeps each slide as a `free` slide (percent boxes, px sizes, images with boxes), so nothing is lost. With `--map N:layout`, it assigns the slide's text, largest first, to that layout's string fields and keeps images as slot images. Images land in `decks/<slug>/assets/` (EMF/WMF are skipped), plus `deck.json` and a stub `brief.md`.

### Workflow

1. Run the import without `--map` first to see the content: `npm run validate <slug>`.
2. Read `designs/<id>/GUIDE.md` and the schema. Decide the layout of each slide by the job it does (cover, scripture, doctrine…).
3. Re-run with `--map ... --force`, or edit `deck.json` by hand for slides that need structured fields (`points`, `columns`, `items`).
4. Check the extraction by eye. The importer is heuristic: one text frame becomes one string, so split it into the layout's real fields (kicker / title / lead / citation).
5. Move speaker notes into `brief.md` under `## Notas` / `### <slide-id>`.
6. `npm run validate <slug>` and `npm run build <slug>`; fix P0 issues.

Never invent content missing from the PPTX; mark gaps with the pack's placeholder convention and tell the user.

## Export: deck → `.pptx`

```bash
npm run export:pptx -- <slug>      # dist/<slug>/<slug>.pptx
```

Text-first export: background, fonts and colors come from the design tokens and the deck palette; images go by slot; speaker notes come from `brief.md`. It is for handouts and PowerPoint editing, not a pixel-faithful copy: the HTML build stays the source of truth.

## Scope

Write only inside `decks/<slug>/`. Never commit, push or open PRs.
