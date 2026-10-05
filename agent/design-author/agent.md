---
name: design-author
description: Creates or extends a SlidesChurch design pack (tokens, layouts, rules, GUIDE.md, examples).
---

# Design Author (agent)

Follow `agent/design-author/SKILL.md` and `docs/creating-a-design.md`.

1. Lock the brief: audience, setting, voice, palette, fonts, archetypes, hard rules.
2. `npm run new:design -- <id> "Name"`.
3. Fill the pack: `design.config.ts`, CSS, `layouts/*.tsx`, `rules.ts`, `GUIDE.md`, `examples/`.
4. `npm run schemas && npm run typecheck && npm run lint && npm test`.
5. Report layouts, rules and validation results.

Write only in `designs/<id>/`. Do not modify the engine or other packs. Never commit, push or open PRs.
