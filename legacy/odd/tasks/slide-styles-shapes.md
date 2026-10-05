# Slide Styles & Shapes — feature plan

> Feature slug: `slide-styles-shapes`
> Goal: extend slide-craft with two new axes — **visual style** (how the slide looks) and **shape** (canvas dimensions) — so the agent/skill can compose multiple presentations of the same content without losing the design discipline.
> Decisions (locked 2025-10-05):
> 1. Three visual styles for v0.1.1: `monastic` (default), `festive`, `typographic`. Other three (`dense`, `iconographic`, `liturgical-dark`) deferred to v0.3.
> 2. Four shapes from day 1: `landscape-16:9`, `portrait-3:4`, `square-1:1`, `ultrawide-21:9`.
> 3. One deck = one shape. Lint enforces (P0 if mixed).
> 4. v0.1.1 patch on top of v0.1.0. Backwards compatible with the three existing catechism decks (no changes needed there).
> 5. Branch `feat/slide-styles-shapes` from `main`. No push.

## What lives where

```
slides/_scaffold/
├── 00–99–* archetype files    # updated to declare data-look + data-shape
├── _looks/                    # NEW
│   ├── monastic.css           # implicit default; empty or near-empty
│   ├── festive.css            # ornament framing + gold stroke
│   └── typographic.css        # very large display text
└── _shapes/                   # NEW
    ├── landscape-16-9.css     # 1920×1080 (default, existing decks)
    ├── portrait-3-4.css      # 1440×1920
    ├── square-1-1.css        # 1440×1440
    └── ultrawide-21-9.css    # 2520×1080
```

## Valid combination matrix (lint-enforced)

```
                            monastic  festive  typographic
Cover                       ✓         ✓        —
Scripture                   ✓         —        ✓
Doctrine                    ✓         —        —
Reflection                  ✓         —        ✓
Prayer                      ✓         ✓        —
Divider                     ✓         ✓        —
Closing                     ✓         ✓        —
```

`—` = not recommended (P1), not forbidden. The agent should default to ✓.

## Budget rules (lint)

- `festive`: max 2 slides per deck, separated by ≥3 other slides.
- `typographic`: max 1 per deck.
- One shape per deck (P0 if violated).
- Every slide should declare `data-shape` (P0 if missing).

## Tasks (work-unit commits in order)

1. **CSS libraries**: `_looks/` (3 files) + `_shapes/` (4 files).
2. **Scaffold updates**: 8 archetype files load look + shape via `<link>` and accept `data-look` / `data-shape` on `<html>`.
3. **Lint extension**: `data-shape` present (P0), `data-look` valid (P1), combination valid (P1), budget (P1), one shape per deck (P0), stage dimensions match declared shape (P0).
4. **Lint tests**: extend `tests/lint-deck.test.js` + update `tests/fixtures/deck-clean.html` and `deck-bad.html`.
5. **Presenter update**: detect `data-shape` on stage, scale to actual dimensions. Stage dimensions in a map: `landscape-16:9 → 1920×1080`, `portrait-3:4 → 1440×1920`, etc.
7. **Skill/agent docs**: `~/.pi/agent/skills/slide-craft/SKILL.md` gains "Visual styles & shapes" section; `~/.pi/agent/agents/gentle-ai-slide-builder.md` gains workflow step 2.5.
8. **Project docs**: README updated; `CHANGELOG.md` created with v0.1.1 notes.
9. **Tag**: `v0.1.1` annotated.

## Backwards compatibility

The three existing catechism decks (`catechism-deck-dios-padre-creador*`, `index.html`) don't declare `data-shape` or `data-look`. The lint treats absence as "implicit `landscape-16:9` + `monastic`" — they pass without changes. The presenter reads `data-shape` and falls back to `landscape-16:9` if absent.

Each task closes with a Conventional Commit work-unit on `feat/slide-styles-shapes`. Branch merged into `main` when v0.1.1 is green; no push.