# Agents

Project skills for SlidesChurch. `SKILL.md` is the runtime contract. `agent.md` only points at it.

Load the matching skill in full before writing a deck, importing a PPTX, or editing a design pack.

| Agent | When | Path |
| --- | --- | --- |
| `slide-builder` | Build, extend, or regenerate a deck as `brief.md` + `deck.json` | `agent/slide-builder/SKILL.md` |
| `pptx-importer` | Import a `.pptx`, or export a deck to PowerPoint | `agent/pptx-importer/SKILL.md` |
| `design-author` | Create or extend a pack under `designs/<id>/` | `agent/design-author/SKILL.md` |

## Loading

1. Match the request to one row. A `.pptx` goes to `pptx-importer` even if the user also asks for a deck.
2. Pass that exact path to the worker. The worker reads the whole `SKILL.md` before editing files.
3. Pack rules (voice, layouts, motifs, variants) stay in `designs/<id>/GUIDE.md`. Do not copy them into a skill.
