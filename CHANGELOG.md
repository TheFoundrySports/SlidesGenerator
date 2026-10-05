# Changelog

All notable changes to SlidesChurch are documented here. Versions follow [Semantic Versioning](https://semver.org/).

## v0.2.0 — 2026-10-05

Minor release. Adds a deterministic PPTX → HTML importer that takes any PowerPoint file and produces a catechetical HTML deck honoring the design system. The importer is the third piece of the slide-craft system, after the manual scaffolds (v0.1.0) and the visual styles + shapes (v0.1.1).

### Added

- `scripts/pptx-to-deck.js` — CLI. Usage:
  - `node scripts/pptx-to-deck.js <input.pptx> <deck-name>` (interactive).
  - `node scripts/pptx-to-deck.js <input.pptx> <deck-name> --map "1:cover,2:scripture,…"` (explicit map, non-interactive).
  - `node scripts/pptx-to-deck.js <input.pptx> <deck-name> --auto` (heuristic-only).
  - Or via npm: `npm run pptx-to-deck -- …`.
- Extracts: text, position, font size, bold, italic, images.
- Discards: color, theme, layout, fonts, animations, transitions (the catechism system provides these).
- Heuristic archetype detection: first slide → cover, last → closing, mostly image → cover, single short text → reflection, 3+ text shapes → doctrine, long text → prayer, default → prayer.
- Interactive mode asks the user to confirm or override each heuristic guess.
- Output: `<deck-name>.html` (root), `<deck-name>.notes.json` (empty sidecar), `slides/img/imported/<deck-name>/...` (extracted images).
- Image sidecar is `.gitignore`-d (same treatment as `Dios_Padre.pptx` and raw slide PNGs).
- SKILL: `agent/slide-pptx-importer/SKILL.md` (mirrored to `~/.pi/agent/skills/slide-pptx-importer/SKILL.md`) — rules, modes, limitations.
- Subagent: `agent/gentle-ai-pptx-importer.md` (mirrored to `~/.pi/agent/agents/gentle-ai-pptx-importer.md`) — runs the CLI in non-interactive mode, fixes lint P0s, registers the deck.
- `package.json` adds `jszip ^3.10.1` as an explicit dependency and a `pptx-to-deck` npm script.

### Tests

- 72 cases total (was 49). +23 tests for `scripts/pptx-to-deck.js`:
  - `emuToPx` conversions.
  - `parseShape` for text + image shapes, including XML entity decoding.
  - `parseSlideXml` ordering across mixed shapes.
  - `parseRelsXml` mapping.
  - `parseSlideSize` defaults.
  - `heuristicArchetype` for every branch.
  - `summarizeSlide` counts and top texts.
  - `parseMapArg` validation.
- All green: `node --test`.
- End-to-end verified on the project's `Dios_Padre.pptx`: 18 slides, 18 images, lint clean (0 issues).

## v0.1.1 — 2026-10-05

Patch release. Adds two new composition axes to slide-craft: **visual style** and **shape**. Backwards compatible with v0.1.0 — the 3 existing catechism decks work without changes.

### Added

- **Visual styles** (`slides/_scaffold/_looks/`):
  - `monastic.css` (default, empty marker)
  - `festive.css` — ornament framing in gold + accent titles
  - `typographic.css` — large display serif body, italic scripture/reflection
- **Shapes** (`slides/_scaffold/_shapes/`):
  - `landscape-16-9.css` — 1920×1080 (default, existing decks)
  - `portrait-3-4.css` — 1440×1920
  - `square-1-1.css` — 1440×1440
  - `ultrawide-21-9.css` — 2520×1080
- Each of the 8 archetype scaffolds loads the default look + shape CSS and carries `class="look-monastic shape-landscape-16-9"` on `<html>`. Switch by editing two `<link>` tags.
- Per-slide look override: `class="look-X"` on a `<section>` overrides the deck default.
- Lint rules (P1 unless noted):
  - `look-valid`: declared look must be one of the 3 valid styles.
  - `shape-valid`: declared shape must be one of the 4 valid shapes.
  - `shape-dimensions` (P0): stage CSS dimensions must match the declared shape.
  - `combination`: each slide's archetype × effective look must be in the valid matrix.
  - `look-budget`: festive ≤ 2 slides per deck; typographic ≤ 1.
- Presenter rule: reads the deck's `<html>` class and scales the stage to the declared shape's dimensions.
- New docs: `docs/extending-slide-craft.md` — how to add a new visual style, shape, or archetype.
- SKILL.md gained a "Visual styles & shapes (v0.1.1)" section.
- `gentle-ai-slide-builder.md` gained a workflow step "Choose look + shape".

### Changed

- `scripts/lint-deck.js` now requires a 4th-class state to verify canvas. The legacy `canvas` rule fires only when no stage CSS is present; the new `shape-dimensions` rule fires when the stage size doesn't match the declared shape.
- `presenter-shared.js` adds `SHAPE_DIMENSIONS`, `extractShape()`, `shapeDimensions()` helpers.
- `presenter.js` reads the loaded deck's shape and uses its dimensions in `computeStageScale()`.

### Tests

- 49 cases total (was 36). +5 presenter-shared tests for the shape registry.
- +8 lint-deck tests for the new axes.
- All green: `node --test`.

## v0.1.0 — 2026-10-05

Initial tagged release. Includes:
- Presenter: HTML slide presenter with notes panel, presenter popup window, three note-display modes.
- Slide-Craft: catechetical slide generation with skill, agent, 8 archetype scaffolds, deterministic lint.
- 36 tests passing (23 presenter + 13 lint).
- Example presenter notes for the catechism v1 deck (`catechism-deck-dios-padre-creador.notes.json`).