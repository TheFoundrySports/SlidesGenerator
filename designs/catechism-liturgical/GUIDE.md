# Catechism Liturgical — Authoring Guide

Agent-facing guide to write a `deck.json` in this design. Visual rationale lives in [`DESIGN.md`](./DESIGN.md); field-by-field contract in `schemas/catechism-liturgical.schema.json`. Set `"design": "catechism-liturgical"` in the deck.

## Purpose

Catechesis and adult faith-formation decks: lessons, retreats, RCIA. A deck reads like a printed catechism: one ink on parchment, serif type, quiet ornament. Not a pitch deck.

## Audience

Adults 30+, projected in a room or chapel, read at distance. Few words per slide, sourced and quotable.

## Voice

- Spanish (neutral, no voseo) unless the user asks otherwise. Set `"lang": "es"`.
- Declarative, monastic. No exclamations outside «quotations». No marketing phrasing.
- Quotations use «angular quotes». Scripture: `Libro cap, vers` (`Juan 3, 16`). Catechism: `CEC N` (never `CCC`).
- Never invent scripture, Catechism paragraphs or magisterial quotes. If a source is unknown, write `[Cita pendiente]` in the text and tell the user.
- No dates, no authors' watermarks, no invented metrics.

## Layout catalog

Pick the archetype by the job the slide does. Fields marked `*` are required.

| Layout | Use it for | Fields | Image slots |
|--------|-----------|--------|-------------|
| `cover` | Opens the deck | `title*`, `eyebrow`, `lead`, `subtitle`, `reference`, `invocation`, `motif` | none |
| `scripture` | One passage is the substance | `reference*`, `text*`, `commentary`, `citation`, `motif` | `right`, `left`, `top` |
| `doctrine` | Teaching: Catechism point(s) | `title*`, `kicker`, `subtitle`, `lead`, `quote{text,source}`, **either** `points[1-8]{term?,text}` **or** `columns[2-3]{heading,text}`, `numbering` (`roman`/`arabic`), `closing`, `citation`, `motif`, `imageFrame` | `right`, `left`, `top`, `inset` |
| `triptych` | Teaching text, one image and a short aside side by side | `title*`, `aside*`, `kicker`, `subtitle`, `leadHeading`, `lead`, `asideHeading`, `asideSource`, `citation`, `motif`, `imageFrame`; one image required | `right` (rendered in the centre) |
| `reflection` | One meditative sentence | `text*`, `kicker`, `title`, `attribution`, `motif` | none |
| `prayer` | Full prayer text | `title*`, `text*`, `amen`, `motif` | none |
| `summary` | Numbered recap | `title*`, `items[2-6]{term?,text}`, `kicker`, `numbering`, `citation` | none |
| `divider` | Part change | `title*`, `kicker`, `subtitle`, `motif` | none |
| `closing` | Ends the deck | `text*`, `kicker`, `reference`, `amen`, `motif` | none |

Core layouts allowed besides these: `text-image`, `image-text`, `image-overlay`, `image-full`, `free`. Prefer the catechism layouts; use core ones only when the user insists on a free composition.

Every slide also has `id*` (kebab-case, unique, stable: speaker notes attach to it), `layout*`, `label*` (short, for the host and thumbnails), and optional `variant`, `images`, `animation`.

## Rhythm

- Default shape of a lesson: `cover → scripture → doctrine → reflection → summary → closing`; dividers and prayers as connective tissue.
- Never three slides of the same layout in a row (validator: P1 `rhythm`).
- At most 5 points per doctrine slide; more means split into doctrine + summary.
- `points` and `columns` are not combined on one slide.
- Max 40 slides per deck.

## Variants and palettes

- `variant` (deck-wide `variant` or per slide): `monastic` (default), `festive` (max 2 slides per deck), `typographic` (max 1).
- Valid pairings: cover → monastic/festive; scripture → monastic/typographic; doctrine → monastic; reflection → monastic/typographic; prayer → monastic/festive; summary → monastic; divider → monastic/festive; closing → monastic/festive.
- `palette` (deck-level, one per deck): `ordinary` (default), `advent-lent`, `christmas-easter`, `pentecost`, `marian`. Pick the liturgical season once.

## Motifs

`motif` takes a name: `cross`, `compass`, `trinity`, `ichthys`, `alpha-omega`, `rule-and-dot`, `dove`, `chi-rho`, `heart`, `crown`, `rays-up`, `rays-down`, `flame`. Use on quiet slides (cover, divider, closing, reflection, scripture). Doctrine and summary stay clear unless the theme calls for it. Max 2 motifs per slide.

## Images

- Only framed sacred art: icons, manuscript illuminations, paintings. No stock photography, no generated photo-real people, no haloed clip-art.
- Files go in `decks/<slug>/assets/`; reference as `assets/<file>` in `images[].src`. No remote URLs.
- Each image: `alt*` (describe it), `slot` (see the catalog), `credit` (artist/source, strongly encouraged), optional `caption`, `fit` (`cover` | `contain`), `focal`.
- One image per slide.
- `imageFrame` (`doctrine`, `scripture`): `framed` (default) draws the bordered plate; `bare` removes border and fill so a transparent PNG diagram sits directly on the slide background. Use `bare` only with transparent PNGs and `fit: contain`. On `doctrine`, slot `inset` draws the image inside the text column, right after the quote and before the points or columns.

## Animations

`animation` per slide, all optional: `enter` (`fade-lift` default, `fade`, `none`), `image` (`slow-zoom`, max 3 slides per deck), `steps: true` (reveal list items one by one with → key). Use `steps` only on slides with points or items. Default to no animation overrides.

## Hard rules

The validator (`npm run validate -- <slug>`) blocks on P0:

- No emoji other than `✝` (max once per deck).
- No Lorem ipsum / "Feature One" placeholders.
- Fonts, colors and shadows are owned by the design; never put raw CSS or HTML in text fields.
- No more than 2 motifs per slide; images need `alt`.

P1 (warnings you should fix): rhythm, variant pairing and budgets, exclamations, `CCC` spelling, 6+ points, point/column mix, several images on one slide.

## Examples

- Minimal: [`examples/minimal.deck.json`](./examples/minimal.deck.json)
- Every layout: [`examples/full.deck.json`](./examples/full.deck.json)
- A real, 30-slide deck: `decks/jesuscristo-capitulo-2/deck.json`
