# Changelog

All notable changes to SlidesChurch are documented here. Versions follow [Semantic Versioning](https://semver.org/).

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