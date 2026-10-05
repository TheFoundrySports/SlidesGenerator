# Slide-Craft — feature plan

> Feature slug: `slide-craft`
> Goal: a stable, repeatable system that generates catechetical HTML slides honoring `DESIGN.md` plus extended rules for images, animations, and text positioning with images.
> Decisions (locked 2025-10-05): ship all four pieces — skill + subagent + scaffold library + lint.

## What lives where

```
~/.pi/agent/skills/slide-craft/SKILL.md
  └─ condensed rules + archetype index + self-check + scaffold pointers
    (loaded into the system prompt when the user invokes slide-craft work)

~/.pi/agent/agents/gentle-ai-slide-builder.md
  └─ subagent for full deck work; loads the skill, generates slides,
     runs the lint, returns a review-ready HTML + optional sidecar

slides/_scaffold/                          # project-local
  ├─ 00-divider.html
  ├─ 01-cover.html
  ├─ 02-scripture.html
  ├─ 03-doctrine.html
  ├─ 04-reflection.html
  ├─ 05-prayer.html
  ├─ 06-summary.html
  └─ 99-closing.html

scripts/lint-deck.js                       # project-local, deterministic
  └─ parses a deck HTML and enforces the rules

tests/lint-deck.test.js                    # node --test for the lint
  └─ fixture: a deck that violates every P0 → must be flagged
  └─ fixture: the catechism v1 deck → must pass
```

## New rules beyond DESIGN.md

- **Image rules**: SVG ornament only by default. Raster images are allowed only on "reproduction" decks where each slide IS the image (e.g. cleaned PDFs), and even then: `loading="lazy"`, `decoding="async"`, `alt` text non-empty when decorative, `<img class="slide-img">` class, sized to fit the safe area.
- **Animation rules**: exactly one canonical reveal — fade + 16 px lift, 350 ms, easing `cubic-bezier(.2,.7,.3,1)`. Triggered by adding `.is-active`. No bounce, slide-in, parallax, or per-slide variants.
- **Text-positioned-with-image rules**: three canonical patterns:
  - `.layout-text-image` — text left (cols 1–6), image right (cols 7–12)
  - `.layout-image-text` — image left (cols 1–6), text right (cols 7–12)
  - `.layout-overlay` — image full-bleed background, text on a translucent `.callout` overlay
  - 24 px gutter between text and image columns.
  - 96 px safe area from every edge.

## Tasks

1. **SKILL.md** (user-global) — condensed rules, archetype index, new rules, lint pointers.
2. **Scaffold library** (`slides/_scaffold/`) — 8 working archetypes with EDITAR markers.
3. **Lint script** (`scripts/lint-deck.js`) — deterministic P0/P1 checks.
4. **Lint tests** (`tests/lint-deck.test.js`) — green-path + red-flag fixtures.
5. **Subagent** (`~/.pi/agent/agents/gentle-ai-slide-builder.md`) — uses skill + scaffolds + lint.
6. **README updates** — document slide-craft workflow alongside the presenter.
7. **Run lint on the four existing decks** — confirm catechism v1/v2/v3/index pass and flag known deviations (e.g. raster images in v1 are an explicit reproduction case).

Each task closes with a Conventional Commit work-unit on the feature branch.