---
name: slide-pptx-importer
description: Convert any .pptx file into a catechetical HTML deck. Use when the user wants to bring a PowerPoint, Keynote export, or LibreOffice Impress file into SlidesChurch as a properly styled deck. Triggers: "convert this pptx", "import this presentation", "pptx to deck", "convertir este pptx", "importar presentación", "tengo un pptx que quiero pasar a html", "convertir PowerPoint".
---

# Slide PPTX Importer

A deterministic PPTX → HTML converter that takes any PowerPoint-style file and produces a catechetical HTML deck honoring `DESIGN.md` and the slide-craft rules.

## What it extracts

| From PPTX | To HTML | Why |
|-----------|---------|-----|
| Text content (`<a:t>`) | Plain text in the right place | The substance of the slide is what matters |
| Position (EMU → px) | Inline `style="position:absolute;…"` | The layout intent is preserved where possible |
| Font size (`<a:rPr sz>`) | Used to pick which text is "title" vs "body" (hierarchy, not raw value) | Re-mapped to catechism tokens |
| Bold / italic | Detected for heuristic mapping | Helps decide Scripture vs Reflection |
| Images (`<p:blipFill>`) | Extracted to `slides/img/imported/<deck>/<name>` and `<img>` referenced | Reproduces the visual content |
| **NOT extracted** | **Why discarded** | |
| Color | Catechism palette is the only ink | The whole system is single-ink; PPTX colors are noise |
| Theme / layout | The 8 archetypes replace all PPTX layouts | |
| Fonts | Cormorant Garamond / EB Garamond everywhere | |
| Background | Always parchment | |
| Animations / transitions | P0 of the system — never | |

## How to invoke

```bash
# Interactive (default): asks the user for the archetype per slide
node scripts/pptx-to-deck.js input.pptx my-deck

# Non-interactive with explicit map (for subagents or CI)
node scripts/pptx-to-deck.js input.pptx my-deck --map "1:cover,2:scripture,3:doctrine,4:summary,5:closing"

# Non-interactive using the heuristic only
node scripts/pptx-to-deck.js input.pptx my-deck --auto
```

Or via the npm script: `npm run pptx-to-deck -- input.pptx my-deck`.

## The 8 archetypes (target output)

The importer maps each PPTX slide to one of the catechetical archetypes. The heuristic:

| Pista | Arquetipo |
|-------|-----------|
| First slide | `cover` |
| Last slide | `closing` |
| Mostly image, < 30 chars text | `cover` |
| 1 text block 5–200 chars | `reflection` |
| ≥ 3 text shapes | `doctrine` |
| Long text (≥ 200 chars) | `prayer` |
| Other | `prayer` (default) |

In interactive mode the CLI prints the extracted content and the heuristic guess, then asks the user to confirm or pick another. The user can override any slide.

## Output files

- `<deck-name>.html` — the deck, in the project root.
- `<deck-name>.notes.json` — empty sidecar (one slot per slide, all empty).
- `slides/img/imported/<deck-name>/...` — extracted images (local sidecar, **not in the repo**; see `.gitignore`).

## After the import

The CLI prints the next step:

```js
// In presenter.js, add to DECKS:
{ file: 'my-deck.html', title: 'My Deck', label: '01 Cover' }
```

Then reload `presenter.html` to see the new deck in the dropdown.

## Workflow

1. **Receive the .pptx path** and a desired deck name from the user.
2. **Run the CLI** in interactive mode if the user is at the terminal, or `--auto` / `--map` if running in a non-interactive context.
3. **Verify the output**: open the generated HTML, walk through the slides, fix any obvious mapping mistakes.
4. **Register the deck** in `DECKS` inside `presenter.js`.
5. **Add notes** by editing `<deck-name>.notes.json` in your editor.
6. **Commit** (when the user is ready).

## Limitations (be honest with the user)

- **Tables, charts, SmartArt, embedded video**: not understood. They get rasterized as the underlying image and pasted on the slide at the source position. The user should re-author these in the catechism system if they want semantic HTML.
- **Animations and transitions**: completely dropped. The catechism system has exactly one animation (350 ms fade+lift on `.is-active`).
- **Mixed shapes per deck**: an imported deck defaults to `landscape-16-9` (1920×1080). If the source PPTX was 4:3 or 16:10, the output is still 16:9 with the original content centered.
- **Multi-language content**: the importer preserves whatever text the PPTX has. The CLI prompts are in Spanish, but the deck content is whatever the user provides.

## Pointers

- Canonical script: `scripts/pptx-to-deck.js`.
- Tests: `tests/pptx-to-deck.test.js` (23 cases, all pure helpers).
- Design contract: `DESIGN.md`.
- Slide-craft skill: `~/.pi/agent/skills/slide-craft/SKILL.md` (the same archetype system the importer targets).
- Subagent that wraps this skill: `~/.pi/agent/agents/gentle-ai-pptx-importer.md`.