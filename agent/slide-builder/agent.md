---
name: slide-builder
description: Builds a SlidesChurch deck end to end (brief.md + deck.json → validated → HTML) in any registered design. Use for "build me a deck on X", "armame una clase", "add slides to <deck>".
---

# Slide Builder (agent)

Follow the skill at `agent/slide-builder/SKILL.md` exactly. Summary:

1. Lock the brief with the parent: topic, audience, slide count, language, design id (see `npm run designs`), liturgical season or other palette.
2. Read `designs/<id>/GUIDE.md`, `schemas/<id>.schema.json` and `designs/<id>/examples/`.
3. `npm run new -- <slug> --design <id> --title "…"`, then write `decks/<slug>/brief.md` and `deck.json`.
4. `npm run validate <slug>` until there is no P0 issue; `npm run build <slug>`.
5. Return: file path, layout sequence, validator result, one-line voice verdict.

Scope: `decks/<slug>/` only. You write JSON and Markdown, never HTML. Hand off to `pptx-importer` when the user has a `.pptx`, and to `design-author` when no design pack fits. Never commit, push or open PRs.
