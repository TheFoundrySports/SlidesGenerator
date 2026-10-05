---
name: slide-craft
description: Generate catechetical HTML slides honoring the Catechism Design System (DESIGN.md, plus the project's slides/_scaffold library + scripts/lint-deck.js). Use when the user asks to create, draft, scaffold, or generate catechetical slides, lessons, sermons, faith-formation decks, or any liturgical 1920×1080 slide deck in the catechetical register. Triggers include "create a slide", "make me a deck about X", "next slide on X", "lesson on X", "doctrine slide", "prayer slide", "cover slide", "summary slide", "agregar slide", "armar clase", "generar lección", "diapositiva", etc.
---

# Slide-Craft — catechetical HTML slides

You are generating catechetical slides in a strict liturgical style. Every deck honors `DESIGN.md` (canonical, 850 lines) and the project's scaffold library + lint script. Read this file, then read `DESIGN.md`, then copy a scaffold from `slides/_scaffold/`.

## The seven tokens (paste verbatim, never redefine)

```
--bg:       #F5EBD9   /* parchment */
--surface:  #EFE3CC   /* callout well */
--fg:       #5C1A1B   /* oxblood ink — every text element */
--muted:    #8A7560   /* captions, counter, refs */
--border:   #B5A285   /* hairline rules */
--accent:   #73201D   /* reserved single-accent use */
--gold:     #A8915C   /* ornament strokes only */
```

`--fg` may be swapped once per deck for liturgical seasons (Advent, Easter, etc.) — see `DESIGN.md §2`.

## The type scale (paste verbatim)

| token | px | use |
|-------|----|-----|
| `--text-meta` | 18 | counter, footer refs |
| `--text-sm` | 22 | marginalia, scripture refs |
| `--text-base` | 28 | body default |
| `--text-lg` | 36 | lead paragraphs |
| `--text-xl` | 56 | sub-headings |
| `--text-2xl` | 80 | slide titles |
| `--text-3xl` | 112 | cover-only hero |

Line-height 1.45 body, 1.15 headings. Letter-spacing `-0.01em` on display sizes ≥80px. Weight ≤600 for liturgical content — never 800+.

## Canvas (non-negotiable)

1920×1080. Scale-to-fit with `transform: scale(var(--scale, 1))`. Safe area 96 px on every edge. 12-column grid, 160 px gutters.

## Animation budget (only one)

```
.slide { opacity: 0; transform: translateY(16px); transition: opacity 350ms cubic-bezier(.2,.7,.3,1), transform 350ms cubic-bezier(.2,.7,.3,1); }
.slide.is-active { opacity: 1; transform: translateY(0); }
```

No bounce, slide-in, parallax, or per-slide variants. Toggle via `.is-active`.

## The eight archetypes

Pick one per slide. Mix rhythm: never three same-archetype in a row.

| Code | File | Use |
|------|------|-----|
| A. Cover | `01-cover.html` | opens deck/chapter/lesson |
| B. Scripture | `02-scripture.html` | one biblical passage is the slide |
| C. Doctrine | `03-doctrine.html` | 3–5 numbered doctrinal points |
| D. Reflection | `04-reflection.html` | one meditative sentence + attribution |
| E. Prayer | `05-prayer.html` | full prayer text + «Amén.» |
| F. Summary | `06-summary.html` | 3–5 numbered takeaways |
| G. Divider | `00-divider.html` | centered ornament + sub-chapter mark |
| H. Closing | `99-closing.html` | blessing + «Amén.» |

Default rhythm for a 12-lesson deck: `Cover · Scripture · Reflection · Doctrine · Summary · Closing`, with dividers between sub-chapters and prayers as connective tissue.

## Visual styles & shapes (v0.1.1)

A slide is a triple `(content archetype, visual style, shape)`. Content archetype comes from the eight archetypes above; the other two axes are declared per-deck and may be overridden per-slide.

### Visual styles (3, defaults to `monastic`)

| Style | Use | Budget |
|-------|-----|--------|
| `monastic` | default; Reflection, Prayer, Scripture | none (default) |
| `festive` | solemnities, feast days, Cover/Closing of celebrations | ≤ 2 per deck |
| `typographic` | slides where text is the visual (large verse, memorable sentence) | ≤ 1 per deck |

`dense`, `iconographic`, `liturgical-dark` are deferred to v0.3 — see `docs/extending-slide-craft.md` to add your own.

### Shapes (4, defaults to `landscape-16-9`)

| Shape | Dimensions | Use |
|-------|------------|-----|
| `landscape-16-9` | 1920×1080 | default; projector, screen |
| `portrait-3-4` | 1440×1920 | mobile, vertical feed |
| `square-1-1` | 1440×1440 | Instagram, square card |
| `ultrawide-21-9` | 2520×1080 | cinematic banner |

One deck = one shape. Mixing shapes in a single deck is not supported.

### How to declare

In a scaffold's `<head>` (load the CSS libraries):

```html
<link rel="stylesheet" href="_looks/monastic.css">
<link rel="stylesheet" href="_shapes/landscape-16-9.css">
```

On `<html>` (deck-wide):

```html
<html lang="es" class="look-monastic shape-landscape-16-9">
```

Or per-slide override on `<section>`:

```html
<section class="slide slide--cover look-festive">
```

### Valid combinations (archetype × look)

```
                            monastic  festive  typographic
Cover                       ✓         ✓        —
Scripture                   ✓         —        ✓
Doctrine                    ✓         —        —
Reflection                  ✓         —        ✓
Prayer                      ✓         ✓        —
Summary                     ✓         —        —
Divider                     ✓         ✓        —
Closing                     ✓         ✓        —
```

`—` means "not recommended" (lint P1), not forbidden.

### Validation

`scripts/lint-deck.js` enforces:
- `data-shape` declared on `<html>` (defaults to `landscape-16-9`); stage CSS must match.
- `data-look` is one of the valid names (defaults to `monastic`).
- Per-slide combination is in the matrix above.
- Per-week budgets: festive ≤ 2, typography ≤ 1.

Existing decks without `class="look-... shape-..."` pass with the defaults — backwards compatible.

See `docs/extending-slide-craft.md` for how to add a new style or shape.

## Image rules (extended, beyond DESIGN.md)

- **Default**: no raster images. SVG ornaments only (monogram, compass, trinity, ichthys, alpha-omega, rule-and-dot — see `DESIGN.md §7`).
- **Reproduction decks** (where each slide IS an extracted image, e.g. cleaned PDF pages): raster allowed, but every `<img>` MUST carry `loading="lazy"` and `decoding="async"`, and the deck's purpose must be documented.
- **Maximum**: 2 SVG motifs per slide.

## Text-positioned-with-image rules (extended)

Three canonical patterns. Pick one per slide. 24 px gutter between text and image columns; 96 px safe area.

```
.layout-text-image   { display: grid; grid-template-columns: 6fr 6fr; gap: 24px; }
.layout-image-text   { display: grid; grid-template-columns: 6fr 6fr; gap: 24px; }
.layout-overlay      { position: relative; }
.layout-overlay .callout-overlay { position: absolute; inset: 96px; background: color-mix(in oklab, var(--surface), transparent 30%); padding: 64px; max-width: 60ch; }
```

## Voice & copy (Spanish es-AR neutral, no voseo)

- Scripture: italic, « » angular quotes, `Libro cap, vv` citation underneath.
- Catechism: `(CEC N)` at end of sentence, period inside. Multiple: `(CEC 279; 295; SC 38)`.
- No dates, no version markers, no author watermark.
- Declarative, not exclamatory. Avoid evangelical intensity. "Dios te ama", not "¡Dios te ama muchísimo!".
- No placeholders: `[Insertar cita bíblica]` is OK; Lorem ipsum / "Feature One" / "Description Two" is P0.
- The cross character `✝` may appear once per deck, usually on the cover.

## Anti-patterns (P0 — fail the gate)

- Sans-serif display font as primary (Inter, Roboto, Arial, Montserrat…). Serif throughout.
- Emoji in body (only `✝`, max once).
- Drop shadows, glow, blur on text. Bright/neon colors. Multiple accent colors per deck.
- Photographic or cartoon content. Inline `<img>` to stock photos.
- Buttons, search boxes, settings panels, theme knobs — any product UI chrome.
- More than 2 SVG ornaments on a slide.
- `scrollIntoView`. Auto-play, sound, video, `<audio>`, `<video>`.
- Lorem ipsum, "Feature One", invented metrics.
- Animations other than the canonical 350 ms fade+lift.

## Self-check (run before emit)

- [ ] Canvas is exactly 1920×1080.
- [ ] All ink resolves to one of the seven tokens.
- [ ] All `<h1>`/`<h2>` use `--font-display`. All `<p>` uses `--font-body`. No sans-serif headings.
- [ ] Title ≥56 px, body ≥28 px, captions ≥22 px, counter 18 px.
- [ ] `.counter` element present, bottom-right.
- [ ] Every `<section class="slide">` has `data-screen-label`.
- [ ] ≤2 SVG motifs per slide.
- [ ] No emoji in body except `✝` once.
- [ ] Each scripture block has a Spanish citation underneath.
- [ ] Each doctrinal point citing CCC has `(CEC N)` in mono `--muted`.
- [ ] No three same-archetype slides in a row.
- [ ] **Lint passes**: `node scripts/lint-deck.js <file.html>` exits 0.

## How to build a deck

1. Read `DESIGN.md` for archetype details and motifs.
2. Plan the slide sequence — write down the rhythm before touching HTML.
3. Copy one scaffold from `slides/_scaffold/` per slide. Rename `[…]` placeholders.
4. Use only the seven tokens; do not introduce new colors.
5. Run `node scripts/lint-deck.js <file.html>` and fix any blocker.
6. Self-check the voice: read aloud. Sounds like a printed catechism, not SaaS.

## Pointers

- Canonical contract: `DESIGN.md` (849 lines — read for detail, do not paste).
- Scaffolds: `slides/_scaffold/` (8 archetypes, paste-and-fill).
- Lint: `scripts/lint-deck.js` (P0 blocks, P1 warns, P2 info).
- Worker agent: `~/.pi/agent/agents/gentle-ai-slide-builder.md` (use when generating a full deck end-to-end).
- Presenter: `presenter.html` (run `serve.sh` and open at `/presenter.html`).