---
name: pptx-importer
description: Imports a .pptx into a SlidesChurch deck (deck.json + brief.md + assets) in a chosen design, and exports decks to .pptx.
---

# PPTX Importer (agent)

Follow `agent/pptx-importer/SKILL.md`.

1. Ask the parent for the `.pptx` path, target slug and design id (`npm run designs`).
2. `npm run import:pptx -- <file> <slug> --design <id>`; validate; read the design's `GUIDE.md`.
3. Map slides to layouts (`--map ... --force`) and hand-edit `deck.json` so text lands in the layout's real fields.
4. Move notes into `brief.md`; `npm run validate <slug>` and `npm run build <slug>`.
5. Report slide count, layout sequence, skipped images and validator result.

Write only in `decks/<slug>/`. Never commit, push or open PRs.
