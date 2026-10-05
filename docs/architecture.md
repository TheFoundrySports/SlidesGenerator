# Architecture

## Data flow

```
brief.md ──► (agent) ──► deck.json ──validate──► render ──► dist/<slug>/<slug>.html
                              │                    ▲
                              └── design pack ─────┘   (schema + layouts + CSS + rules)
```

- `deck.json` is the only source of truth for what appears on screen. The HTML is a build artifact.
- `brief.md` holds research and speaker notes. `## Notas` / `## Notes` with `### <slide-id>` blocks becomes `dist/<slug>/<slug>.notes.json` (`{ deck, slides: [...] }`, aligned to slide order).
- The presenter can edit notes when started with `npm run serve`: it autosaves through `PUT /api/notes/<slug>` (body `{ slides: string[] }`), which rewrites only the `## Notas` block of `brief.md` (`serializeBriefNotes`; lines that look like `##`/`###` headings are escaped with a leading `\`) and refreshes the sidecar. Writes need the `X-SlidesChurch: 1` header, a local `Host` and a same-origin `Origin`. On static hosts `/api/capabilities` is missing, so notes are read-only and can be exported as a pasteable `## Notas` markdown file. Notes render a small markdown subset (`renderNotesMarkdown`, HTML-escaped).

## Engine vs design pack

| Engine (`src/`) | Design pack (`designs/<id>/`) |
|-----------------|-------------------------------|
| Zod core schema (deck, slide, image, animation) | Tokens, fonts, palettes, variants |
| `defineDesign()` composes a per-design deck schema (strict discriminated union on `layout`) | Custom layouts (`defineLayout`) |
| Core layouts: `text-image`, `image-text`, `image-overlay`, `image-full`, `free` | Which core layouts are allowed |
| Render (`renderToStaticMarkup`), runtime (scale, keys, `#n`, steps, counter), animation presets | Allowed animations and budgets |
| Lint stages and core rules | Design rules (`rules.ts`) |
| Importers/exporters, CLIs, preview and presenter apps | `GUIDE.md` (agent contract), `DESIGN.md` (rationale), examples |

Designs are discovered by `designs/registry.ts` (Node: dynamic import; Vite: `import.meta.glob`). Folders starting with `_` are templates and are skipped. A deck selects its pack with `"design": "<id>"`.

## Rendering

`renderDeckHtml(deck, design, options)` returns one HTML document with two style scopes: `data-scope="slides"` (reused by the presenter) and `data-scope="page"` (standalone only). Each slide is a `<section>` with `data-layout`, `data-slide-id`, `data-screen-label`, `data-variant`, `data-palette`, `data-enter`, `data-steps`. Steppable items carry `data-step`; the runtime adds `.is-revealed`. Images are copied next to the HTML or inlined with `--inline`.

## Validation

1. Schema (Zod): fields, enums, ids, limits.
2. JSON lint: core rules (ids, assets, budgets) plus the design's `rules.ts`.
3. HTML lint on the rendered output.

Severities: **P0** blocks the build, **P1** warns, **P2** informs.

## Presenter and preview

- `preview/` (`npm run dev`): gallery of all decks and a live deck view that reloads on changes.
- `presenter/` (`npm run build:presenter`, served with `npm run serve`): picks a deck from `dist/decks.json`, shows scaled slides with notes, and opens a popup notes window. Its chrome uses `--p-*` variables so the deck's own tokens never leak.

## PPTX

- Import: `src/importers/pptx.ts` extracts text boxes, positions, sizes and images; slides become `free` slides or are mapped to a layout.
- Export: `src/exporters/pptx.ts` flattens layouts into typographic slides using the design tokens and the deck's palette.
