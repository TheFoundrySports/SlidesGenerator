# PPTX Importer — feature plan

> Feature slug: `pptx-importer`
> Goal: convert any PPTX into a catechetical HTML deck. Only extract text, position, and images; apply the design system from `DESIGN.md` for styling.
> Decisions (locked 2025-10-05):
> 1. Three layers: CLI (`scripts/pptx-to-deck.js`) + SKILL (`slide-pptx-importer`) + subagent (`gentle-ai-pptx-importer`).
> 2. Interactive mode by default: CLI prompts user for archetype per slide; `--map` and `--auto` flags for non-interactive.
> 3. Imported images go to `slides/img/imported/<deck>/` (local sidecar, .gitignore — not in the repo).
> 4. Branch `feat/pptx-importer` from `main`. Tag `v0.2.0`. No push.

## What lives where

```
scripts/pptx-to-deck.js                      # NEW — CLI: extract + ask + generate
tests/pptx-to-deck.test.js                  # NEW — unit tests for extraction + heuristic
agent/slide-pptx-importer/SKILL.md          # NEW — rules
~/.pi/agent/skills/slide-pptx-importer/...  # NEW — user-global mirror
agent/gentle-ai-pptx-importer.md            # NEW — subagent
~/.pi/agent/agents/gentle-ai-pptx-importer  # NEW — user-global mirror
.gitignore                                  # UPDATE — add slides/img/imported/
README.md                                   # UPDATE — add PPTX Importer section
CHANGELOG.md                                # UPDATE — v0.2.0 entry
```

## Extraction rules (what the CLI does)

- **SÍ**: text content, position (EMU), font size, font weight, italic, alignment, images.
- **NO**: colors (use 7 tokens), fonts (Cormorant Garamond / EB Garamond), themes, layouts, animations, backgrounds, transitions.

## Archetype mapping (heuristic)

| Pista | Arquetipo |
|-------|-----------|
| Slide 1 | `cover` |
| Last slide | `closing` |
| Mostly image, < 30 chars text | `cover` |
| Single text block 5–200 chars | `reflection` |
| Multiple text shapes (≥ 3) | `doctrine` |
| Long text (≥ 200 chars) ending with Amén | `prayer` |
| Other | `prayer` (default) |

Override: `--map "1:cover,2:scripture,3:doctrine,4:summary,5:closing"`.

## Tasks (work-unit commits on branch `feat/pptx-importer`)

1. `feat(pptx-importer): pure extraction helpers + tests` — `parseSlideXml`, `emuToPx`, `heuristicArchetype`. No jszip yet.
2. `feat(pptx-importer): CLI extract + interactive + generate` — `scripts/pptx-to-deck.js` end-to-end.
3. `feat(slide-craft): lint accepts imported decks` — make sure the lint doesn't false-positive on imported content (in particular the image rules).
4. `chore: add slides/img/imported/ to .gitignore`.
5. `docs(slide-craft): slide-pptx-importer skill` — the SKILL.md, mirrored to user-global.
6. `feat(slide-craft): gentle-ai-pptx-importer agent` — the subagent, mirrored to user-global.
7. `docs: README + CHANGELOG for v0.2.0`.
8. `chore(release): tag v0.2.0`.

## Backwards compatibility

- No existing files are modified except .gitignore, README, CHANGELOG.
- No existing tests change.
- The new CLI is a new feature, doesn't replace anything.

## Out of scope for v0.2.0

- Tables, charts, SmartArt (rasterize as image).
- Preserving animations or transitions.
- Mixed shapes within a deck (still one shape per deck — the imported deck defaults to landscape-16-9).
- Multi-language support (the importer preserves whatever text the PPTX has, but the UI is Spanish).