# SlidesChurch Presenter

A single-page app that loads any HTML catechism deck in this repo and lets you view presenter notes side-by-side. Slides stay on the projector; notes land in whichever mode you pick.

## Quick start

```bash
./serve.sh
# → open http://127.0.0.1:8000/presenter.html
```

The launcher uses `python3 -m http.server` because browsers block `fetch()` of local JSON under `file://`. Pick a custom port with `./serve.sh 8080` or `PORT=3000 ./serve.sh`.

## Three ways to view notes

| Mode | How to open | Best for |
|------|-------------|----------|
| **Toggle drawer** | Press `N` | Single monitor, on-stage prompting. Slide reflows to make room. |
| **Side panel (split)** | Click `Notas` in the topbar | Persistent notes alongside the slide. |
| **Presenter window** | Press `W` (or click `Presentador`) | Two-monitor setup. Slides fullscreen on the projector; current slide + next slide + timer in the popup on the other monitor. |

The popup syncs over `BroadcastChannel('slideschurch')` — no server glue, just same-origin windows.

## Keyboard shortcuts

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

## Notes sidecar format

Each deck `<name>.html` may have a sibling `<name>.notes.json`:

```json
{
  "deck": "catechism-deck-dios-padre-creador-3",
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

Edit the sidecar in your editor of choice — the presenter never writes to disk.

## Adding a new deck

1. Drop the deck HTML in the project root (or in `slides/`).
2. Add an entry to the `DECKS` array in `presenter.js`:

   ```js
   { file: 'my-new-deck.html', title: 'My New Deck', label: '01 Cover' }
   ```

3. (Optional) Create `my-new-deck.notes.json` next to it.
4. Reload `presenter.html`.

The deck's `<style>` blocks are extracted and re-injected. The deck's `<script>` blocks are dropped — the presenter owns navigation, scaling, and hotkeys.

## Architecture

```
presenter.html           # main app + presenter-window popup shell (?popup=1)
presenter.js             # main app logic: deck loader, nav, hotkeys, popup sync
presenter-shared.js      # pure helpers (parseDeckHtml, parseSidecar, …)
                         #   dual-environment: window + CommonJS
tests/presenter-shared.test.js   # node --test suite (23 cases, all green)
tests/fixtures/mini-deck.html   # hand-written fixture
serve.sh                 # python3 -m http.server launcher
```

`presenter-shared.js` is deliberately free of DOM access so it can run under `node --test` without jsdom. Browser-only code lives in `presenter.js`.

## Tests

```bash
node --test
```

Auto-discovers every `*.test.js` inside `tests/`.

36 cases covering:

- `parseDeckHtml`: regex pulls `<style>` and `<section class="slide">`; ignores other sections.
- `parseSidecar`: bare-array and `{slides: []}` shapes, padding, truncation, malformed JSON, type coercion.
- `emptySidecar`: valid JSON template with N empty slots.
- `computeStageScale`: 1920×1080 canvas fitted to arbitrary viewports.
- `createBus`: pub-sub with `BroadcastChannel` when available, in-process fallback otherwise.

## Slide-Craft — generate catechetical slides

A four-piece system that produces catechetical HTML slides honoring `DESIGN.md` with stable, repeatable rules.

### Pieces

| Where | What |
|-------|------|
| `~/.pi/agent/skills/slide-craft/SKILL.md` | Condensed rules + archetype index + image/animation rules + self-check. Auto-loaded when the user invokes catechetical slide work. |
| `~/.pi/agent/agents/gentle-ai-slide-builder.md` | Subagent for full deck generation. Loads the skill, copies scaffolds, fills placeholders, runs the lint, returns review-ready HTML. |
| `slides/_scaffold/` | 8 working archetypes — paste-and-fill HTML for Cover, Scripture, Doctrine, Reflection, Prayer, Summary, Divider, Closing. |
| `scripts/lint-deck.js` | Deterministic P0/P1/P2 checks: canvas, palette tokens, motif budget, sans-serif display, emoji, raw hex, image rules, animation budget. |

### Two ways to use

**Manual (with the skill loaded):** copy a scaffold from `slides/_scaffold/`, fill the `<!-- EDITAR: … -->` placeholders, then:

```bash
node scripts/lint-deck.js my-new-deck.html
# → exit 0 means no P0 blockers; P1/P2 are warnings
```

**Delegated (with the agent):** ask the parent to delegate to `gentle-ai-slide-builder`. The agent reads `DESIGN.md`, plans the rhythm, copies scaffolds, runs the lint, and emits a review-ready deck.

### Eight archetypes (default rhythm)

```
Cover (A) → Scripture (B) → Reflection (D) → Doctrine (C) → Summary (F) → Closing (H)
```

Insert Divider (G) between sub-chapters and Prayer (E) as connective tissue. Never three same-archetype in a row.

### Lint rules

| Tier | Effect | Rules |
|------|--------|-------|
| **P0** | blocker — exit 1 | canvas 1920×1080, palette tokens (no raw hex), ≤2 SVG/slide, sans-serif display forbidden, emoji forbidden (only ✝ once), script count > 1 |
| **P1** | warning — printed, exit 0 | counter HUD present, data-screen-label on every slide, slide count ≤40, single script shape (must toggle `is-active`), image lazy + decode |
| **P2** | info | transition duration ≠ 350ms |

### Run the lint on the existing decks

```bash
node scripts/lint-deck.js catechism-deck-dios-padre-creador*.html index.html
```

Current results: v1 + index clean; v2 + v3 each show one P1 (`<img>` without `loading="lazy"`). These are pre-existing deviations in the older decks, not from slide-craft.

## What it doesn't do (yet)

- No editing of notes inside the app — by design, edited in your editor.
- No remote hosting, no auth, no upload.
- No modifications to existing decks.
- No draggable splitter, no markdown rendering in notes, no per-slide timer reset between modes.

These are good follow-ups if you want them.