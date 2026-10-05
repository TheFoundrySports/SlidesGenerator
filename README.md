# SlidesChurch

A two-piece system for catechetical HTML slide decks. **Presenter** loads any deck in the repo and shows presenter notes side-by-side on a second monitor. **Slide-Craft** is a deterministic generator that produces new decks honoring the Catechism Design System (`DESIGN.md`) with stable, repeatable rules.

- **Status**: v0.1.1 — see [CHANGELOG.md](CHANGELOG.md).
- **Design contract**: [DESIGN.md](DESIGN.md) (canonical, 850 lines).
- **Tests**: 49 cases, all green — `node --test`.

## Contents

- [What you need](#what-you-need)
- [Quick start](#quick-start)
- [The Presenter](#the-presenter) — load and present a deck with notes
- [The Slide-Craft](#the-slide-craft) — generate new catechetical decks
- [Visual styles & shapes (v0.1.1)](#visual-styles--shapes-v011) — compose the look of a deck
- [How to extend](#how-to-extend) — add a style, shape, or archetype
- [Architecture](#architecture) — file map
- [Tests](#tests) — how to run them
- [Versioning](#versioning) — version policy and changelog

## What you need

- **Python 3** (for the dev server)
- **Node.js 18+** (for the tests and the lint; `node --test` is built-in)
- A modern browser (Chrome, Firefox, Safari, Edge)
- A terminal

No `npm install` step. No build. Plain HTML/JS/CSS.

## Quick start

```bash
./serve.sh
# → open http://127.0.0.1:8000/presenter.html
```

The launcher uses `python3 -m http.server` because browsers block `fetch()` of local JSON under the `file://` scheme. Custom port: `./serve.sh 8080` or `PORT=3000 ./serve.sh`.

If the launcher isn't executable: `chmod +x serve.sh`.

To use the slide-craft skill and agent with Pi, install them once per machine:

```bash
# SKILL.md (condensed rules + archetype index + image/animation rules)
mkdir -p ~/.pi/agent/skills/slide-craft
cp agent/slide-craft/SKILL.md ~/.pi/agent/skills/slide-craft/SKILL.md

# Subagent for end-to-end deck generation
cp agent/gentle-ai-slide-builder.md ~/.pi/agent/agents/
```

The `agent/` directory in this repo is the source of truth; re-run the `cp` commands after pulling new versions.

## The Presenter

`presenter.html` is the main app. It loads any HTML deck in the repo, parses its `<section class="slide">` elements, and shows them one at a time scaled to fit your viewport. Presenter notes (in a sibling `.notes.json`) appear in a side panel and in a separate popup window.

### Load a deck

Use the dropdown in the topbar. The 3 existing catechetical decks and `index.html` ship pre-listed in the `DECKS` array at the top of `presenter.js`. To add a new deck:

1. Drop the HTML in the project root (or in `slides/`).
2. Edit `DECKS` in `presenter.js`:

   ```js
   { file: 'my-new-deck.html', title: 'My New Deck', label: '01 Cover' }
   ```

3. (Optional) Create `my-new-deck.notes.json` next to it (format below).
4. Reload `presenter.html`.

The presenter extracts the deck's `<style>` blocks and re-injects them; the deck's `<script>` blocks are dropped (the presenter owns navigation, scaling, and hotkeys).

### Three ways to view notes

| Mode | How to open | Best for |
|------|-------------|----------|
| **Toggle drawer** | Press `N` | Single monitor, on-stage prompting. Slide reflows to make room. |
| **Side panel (split)** | Click `Notas` in the topbar | Persistent notes alongside the slide. |
| **Presenter window** | Press `W` (or click `Presentador`) | Two-monitor setup. Slides fullscreen on the projector; current slide + next slide + timer in the popup on the other monitor. |

The popup syncs over `BroadcastChannel('slideschurch')` — no server glue, just same-origin windows.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `→` `Space` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `N` | Toggle notes drawer |
| `W` | Open presenter window |
| `F` | Toggle browser fullscreen |
| `?` | Help overlay |
| `Esc` | Close drawer / help / exit fullscreen |

### Notes sidecar format

Each deck `<name>.html` may have a sibling `<name>.notes.json`:

```json
{
  "deck": "demo-deck",
  "slides": [
    "Notes for slide 1 — plain text or light markdown.",
    "Notes for slide 2 — keep it to the speaker's eye.",
    ""
  ]
}
```

- `slides` is an array of strings, one per slide, **index-aligned to slide order**.
- A bare array is also accepted: `["a", "b", "c"]`.
- Missing or short arrays are padded with empty strings; the UI shows "Sin notas para esta slide."
- If the sidecar is missing entirely, the notes pane shows the expected filename so you can create it.
- Notes are **read-only** inside the presenter. Edit the JSON in your editor.

## The Slide-Craft

A four-piece system that produces catechetical HTML slides honoring `DESIGN.md` with stable, repeatable rules.

### Pieces

| Where | What |
|-------|------|
| `agent/slide-craft/SKILL.md` (mirrored to `~/.pi/agent/skills/slide-craft/`) | Condensed rules + archetype index + image/animation rules + self-check. Auto-loaded when the model detects catechetical slide work. |
| `agent/gentle-ai-slide-builder.md` (mirrored to `~/.pi/agent/agents/`) | Subagent for full deck generation. Loads the skill, copies scaffolds, fills placeholders, runs the lint, returns review-ready HTML. |
| `slides/_scaffold/` | 8 working archetype scaffolds — paste-and-fill HTML for Cover, Scripture, Doctrine, Reflection, Prayer, Summary, Divider, Closing. Plus the `_looks/` and `_shapes/` CSS libraries. |
| `scripts/lint-deck.js` | Deterministic P0/P1/P2 checks: canvas, palette tokens, motif budget, sans-serif display, emoji, raw hex, image rules, animation budget, look/shape axes (v0.1.1). |

### Two ways to use

**Manual (with the skill loaded):** copy a scaffold from `slides/_scaffold/`, fill the `<!-- EDITAR: … -->` placeholders, then:

```bash
node scripts/lint-deck.js my-new-deck.html
# → exit 0 means no P0 blockers; P1/P2 are warnings
```

**Delegated (with the agent):** ask the Pi session to delegate to `gentle-ai-slide-builder` with a topic and a target slide count. The agent reads `DESIGN.md`, plans the rhythm (default sequence below), chooses a look and a shape (defaults: `monastic` + `landscape-16-9`), copies scaffolds, runs the lint, and emits a review-ready deck.

### Eight archetypes (default rhythm)

```
Cover (A) → Scripture (B) → Reflection (D) → Doctrine (C) → Summary (F) → Closing (H)
```

Insert Divider (G) between sub-chapters and Prayer (E) as connective tissue. Never three same-archetype in a row.

### Lint rules

| Tier | Effect | Rules |
|------|--------|-------|
| **P0** | blocker — exit 1 | canvas 1920×1080 (or shape-matching), palette tokens (no raw hex), ≤2 SVG/slide, sans-serif display forbidden, emoji forbidden (only ✝ once), script count > 1, stage-dimensions mismatch |
| **P1** | warning — printed, exit 0 | counter HUD, data-screen-label, slide count ≤40, single script shape, image lazy + decode, look-valid, shape-valid, combination, look-budget |
| **P2** | info | transition duration ≠ 350ms |

### Run the lint on the existing decks

```bash
node scripts/lint-deck.js demo-deck.html index.html
```

Current results: v1 + index clean; v2 + v3 each show one P1 (`<img>` without `loading="lazy"`). These are pre-existing deviations in the older decks, not from slide-craft.

## PPTX Importer (v0.2.0)

Bring any PowerPoint file into SlidesChurch as a properly styled catechetical deck. The importer extracts only text, position, and images from the source PPTX; the style comes from `DESIGN.md` and the slide-craft system.

### What gets extracted

| From PPTX | To HTML | Why |
|-----------|---------|-----|
| Text content, position, font size, bold, italic | Positioned text in catechism typography | Substance + layout intent |
| Images | Extracted to `slides/img/imported/<deck>/` and `<img>`-referenced | Visual content preserved |
| Color, theme, layout, fonts, animations | **Discarded** | The catechism system is single-ink, single-archetype, single-font |

### Three modes

```bash
# Interactive: asks the user for the archetype per slide
node scripts/pptx-to-deck.js input.pptx my-deck

# Non-interactive with explicit map (for subagents or CI)
node scripts/pptx-to-deck.js input.pptx my-deck \
  --map "1:cover,2:scripture,3:doctrine,4:summary,5:closing"

# Non-interactive using the heuristic only
node scripts/pptx-to-deck.js input.pptx my-deck --auto
```

Or via npm: `npm run pptx-to-deck -- input.pptx my-deck`.

### Heuristic archetype mapping

The CLI picks an archetype per slide using:

| Pista | Arquetipo |
|-------|-----------|
| First slide | `cover` |
| Last slide | `closing` |
| Mostly image, < 30 chars text | `cover` |
| 1 text block 5–200 chars | `reflection` |
| ≥ 3 text shapes | `doctrine` |
| Long text (≥ 200 chars) | `prayer` |
| Other | `prayer` (default) |

In interactive mode the user confirms or overrides each guess. `--map` and `--auto` skip the prompts.

### Output files

- `<deck-name>.html` in the project root — the deck, ready for the presenter.
- `<deck-name>.notes.json` — empty sidecar (one slot per slide).
- `slides/img/imported/<deck-name>/...` — extracted images (local sidecar, **not in the repo**; see `.gitignore`).

After the import, add the deck to `DECKS` in `presenter.js`:

```js
{ file: 'my-deck.html', title: 'My Deck', label: '01 Cover' }
```

### What it doesn't do (be honest with the user)

- **Tables, charts, SmartArt, embedded video**: rasterized as the underlying image and pasted at the source position. Re-author in the catechism system if you want semantic HTML.
- **Animations and transitions**: completely dropped.
- **Mixed shapes per deck**: the imported deck defaults to `landscape-16-9` (1920×1080).

### Where the agent lives

The importer is also a Pi skill + subagent for end-to-end use:

- Skill: `agent/slide-pptx-importer/SKILL.md` (mirrored to `~/.pi/agent/skills/slide-pptx-importer/SKILL.md`).
- Subagent: `agent/gentle-ai-pptx-importer.md` (mirrored to `~/.pi/agent/agents/gentle-ai-pptx-importer.md`) — runs the CLI in non-interactive mode, fixes lint P0s, registers the deck.

## Visual styles & shapes (v0.1.1)

Two new axes complement the content archetypes. Both are declared on `<html>` and detected automatically by the presenter and the lint.

### Visual styles (`class="look-X"`)

| Style | When | Budget |
|-------|------|--------|
| `monastic` | default; Reflection, Prayer, Scripture | unlimited |
| `festive` | solemnities, feast covers, Closing of celebrations | ≤ 2 slides per deck |
| `typographic` | slides where text is the visual (large verse, memorable sentence) | ≤ 1 slide per deck |

**Per-slide override:** add `class="look-X"` to a `<section>` to override the deck default. Used for one-off festive or typographic moments in an otherwise monastic deck.

CSS lives in `slides/_scaffold/_looks/`.

### Shapes (`class="shape-X"`, deck-wide)

| Shape | Dimensions | When |
|-------|------------|------|
| `landscape-16-9` | 1920×1080 | default; projector, screen |
| `portrait-3-4` | 1440×1920 | mobile, vertical feed |
| `square-1-1` | 1440×1440 | Instagram, square card |
| `ultrawide-21-9` | 2520×1080 | cinematic banner |

**One deck = one shape.** Mixing shapes in a single deck is not supported — the presenter scales every slide to the deck's declared dimensions.

CSS lives in `slides/_scaffold/_shapes/`.

### Switching a scaffold's look + shape

In the scaffold's `<head>`, change the two `<link>` tags and the `<html>` class:

```html
<!-- before: monastic + landscape-16-9 -->
<link rel="stylesheet" href="_looks/monastic.css">
<link rel="stylesheet" href="_shapes/landscape-16-9.css">
<html lang="es" class="look-monastic shape-landscape-16-9">

<!-- after: festive + portrait-3-4 -->
<link rel="stylesheet" href="_looks/festive.css">
<link rel="stylesheet" href="_shapes/portrait-3-4.css">
<html lang="es" class="look-festive shape-portrait-3-4">
```

### Backwards compatibility

Existing decks without `data-shape` or `data-look` defaults to `landscape-16-9` + `monastic` and pass the lint unchanged. The 3 existing catechism decks work without any modification.

## How to extend

See [docs/extending-slide-craft.md](docs/extending-slide-craft.md) for the step-by-step process to add a new visual style, shape, or content archetype. The doc covers:

- 10-step procedure for adding a new visual style.
- 7-step procedure for adding a new shape.
- 7-step procedure for adding a new archetype.
- Testing checklist.
- Version bump policy (patch for style/shape, minor for archetype).

The source-of-truth files for the slide-craft are in `agent/slide-craft/SKILL.md` and `agent/gentle-ai-slide-builder.md`. The user-global installs at `~/.pi/agent/...` must be re-synced after each update.

## Architecture

```
SlidesChurch/
├── presenter.html              # main app + presenter-window popup shell (?popup=1)
├── presenter.js                # main app logic: deck loader, nav, hotkeys, popup sync
├── presenter-shared.js         # pure helpers: parseDeckHtml, parseSidecar, parseShape
│                               #   dual-environment: window + CommonJS
├── serve.sh                    # python3 -m http.server launcher
│
├── slides/
│   ├── img/cleaned/            # cleaned slide images used by the v1 catechism deck
│   ├── bbox/                   # OCR work artifacts (regenerable)
│   ├── ocr/                    # OCR text output per slide
│   └── _scaffold/              # 8 working archetype scaffolds
│       ├── 00-divider.html
│       ├── 01-cover.html
│       ├── 02-scripture.html
│       ├── 03-doctrine.html
│       ├── 04-reflection.html
│       ├── 05-prayer.html
│       ├── 06-summary.html
│       ├── 99-closing.html
│       ├── _looks/             # CSS libraries: monastic, festive, typographic
│       └── _shapes/            # CSS libraries: 16-9, 3-4, 1-1, 21-9
│
├── scripts/
│   └── lint-deck.js            # P0/P1/P2 deterministic checks
│
├── agent/                      # source of truth for Pi integration
│   ├── slide-craft/SKILL.md    # user-global install at ~/.pi/agent/skills/
│   └── gentle-ai-slide-builder.md  # user-global install at ~/.pi/agent/agents/
│
├── tests/
│   ├── presenter-shared.test.js   # 28 unit tests
│   ├── lint-deck.test.js          # 21 unit tests
│   ├── smoke-parse-decks.js       # CLI smoke test for all decks
│   └── fixtures/                  # mini-deck, deck-clean, deck-bad
│
├── docs/
│   └── extending-slide-craft.md   # how to add a new style/shape/archetype
│
├── DESIGN.md                   # canonical catechism design contract (850 lines)
├── demo-deck.html             # generated demo (PPTX importer output)
├── demo-deck.notes.json       # empty sidecar, ready for notes
│
├── package.json                # npm scripts: test, lint
├── LICENSE                     # MIT
├── CHANGELOG.md                # v0.1.0, v0.1.1
└── README.md                   # this file
```

`presenter-shared.js` is deliberately free of DOM access so it can run under `node --test` without jsdom. Browser-only code lives in `presenter.js`.

The two agent files in `agent/` are the source of truth for the slide-craft skill. Whenever you update them, mirror the change to `~/.pi/agent/skills/slide-craft/SKILL.md` and `~/.pi/agent/agents/gentle-ai-slide-builder.md` in the same commit.

## Tests

```bash
node --test
```

Auto-discovers every `*.test.js` inside `tests/`. 49 cases, all green:

- `parseDeckHtml`: regex pulls `<style>` and `<section class="slide">`; ignores other sections.
- `parseSidecar`: bare-array and `{slides: []}` shapes, padding, truncation, malformed JSON, type coercion.
- `emptySidecar`: valid JSON template with N empty slots.
- `computeStageScale`: arbitrary canvas fitted to any viewport.
- `createBus`: pub-sub with `BroadcastChannel` when available, in-process fallback otherwise.
- `SHAPE_DIMENSIONS`, `extractShape`, `shapeDimensions` (v0.1.1).
- Lint rules: canvas, counter, screen-label, slide-count, sans-serif-display, motif-budget, emoji, script-tags, script-shape, palette-tokens, image-lazy, image-decode, animation-duration, look-valid, shape-valid, shape-dimensions, combination, look-budget.

Smoke test: `node tests/smoke-parse-decks.js` parses every HTML deck in the project root and asserts slide counts.

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **Patch** (v0.1.x): new visual style, new shape, new motif, new anti-pattern rule.
- **Minor** (v0.x.0): new archetype, breaking change to existing scaffolds.

See [CHANGELOG.md](CHANGELOG.md) for the release history.

## License

[MIT](LICENSE). Copyright (c) 2026 Francisco J. Seva.