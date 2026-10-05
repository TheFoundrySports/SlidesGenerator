# SlidesChurch

Deck-as-data slide engine. A deck is a folder with **`deck.json`** (text, images, positions, animations: the validated source of truth) and **`brief.md`** (research, intent, speaker notes). One build renders **one standalone HTML file per deck**. Agents write data, never HTML.

Visual systems are pluggable **design packs** under `designs/<id>/`; the first one is `catechism-liturgical`.

- **Version**: 0.3.0, see [CHANGELOG.md](CHANGELOG.md).
- **Stack**: Node ≥ 20, TypeScript, React (TSX rendered to static HTML), Zod, Vite, Vitest.
- **Docs**: [architecture](docs/architecture.md) · [creating a design](docs/creating-a-design.md) · [catechism design](designs/catechism-liturgical/DESIGN.md).

## Quick start

```bash
npm install
npm run designs                 # list design packs
npm run new -- my-deck --design catechism-liturgical --title "My deck"
npm run validate my-deck        # lint (P0 blocks, P1 warns, P2 informs)
npm run build my-deck           # → dist/my-deck/my-deck.html (+ .notes.json, assets)
npm run dev                     # preview app: gallery at /, a deck at /?deck=my-deck
npm run build:presenter && npm run serve   # presenter with notes → http://localhost:8000 (press E to edit notes; they are saved to brief.md)
```

## Folder structure

```
decks/<slug>/        brief.md · deck.json · assets/
designs/<id>/        design.config.ts · tokens/base/variants CSS · layouts/*.tsx · rules.ts · GUIDE.md · DESIGN.md · examples/
designs/_template/   skeleton copied by `npm run new:design`
schemas/<id>.schema.json   JSON Schema per design (generated, for agents and editors)
src/                 engine: schema, layouts, render, runtime, lint, importers, exporters
cli/                 build · validate · new · new-design · designs · schemas · import-pptx · export-pptx · serve
preview/             Vite dev app (gallery + live deck view)
presenter/           presenter app (deck picker, notes panel, popup)
agent/               agent skills: slide-builder, pptx-importer, design-author
dist/                build output (git-ignored)
legacy/              the previous HTML/Python system, kept for reference
```

## Commands

| Command | What it does |
|---------|--------------|
| `npm run designs [id] [--json]` | List design packs or describe one (layouts, variants, palettes). |
| `npm run new -- <slug> --design <id> [--title]` | Scaffold `decks/<slug>/`. |
| `npm run new:design -- <id> "<Name>"` | Create a design pack from `designs/_template/`. |
| `npm run validate [<slug>… \| --all]` | Schema + lint (core and design rules) + HTML lint of the render. |
| `npm run build [<slug>… \| --all] [--inline] [--offline]` | Render HTML, notes, assets and `dist/decks.json`. |
| `npm run schemas` | Regenerate `schemas/<id>.schema.json`. |
| `npm run import:pptx -- <file.pptx> <slug> --design <id> [--map "1:cover,…"]` | PPTX → `deck.json`. |
| `npm run export:pptx -- <slug>` | `deck.json` → `.pptx` (text-first, with notes). |
| `npm run dev` / `build:presenter` / `serve` | Preview app, presenter build, static server for `dist/`. |
| `npm run typecheck` / `npm test` | Type check and Vitest suite. |

## Authoring a deck

1. Write `brief.md`: intention, audience and tone, sources, structure and `## Notas` with `### <slide-id>` blocks.
2. Write `deck.json`. The first keys are `design`, `lang`, `palette`; each slide has `id`, `layout`, `label`, the layout's fields, optional `images` (`src`, `alt`, `slot`, `fit`, `focal`, `credit`) and `animation` (`enter`, `steps`, `image`).
3. `npm run validate <slug>`, fix, `npm run build <slug>`.

Regenerating a deck means editing the JSON and rebuilding. Keep slide ids stable, since notes attach to them.

## Agents

| Agent | Job |
|-------|-----|
| [`slide-builder`](agent/slide-builder/SKILL.md) | Topic → `brief.md` + `deck.json` → validated HTML, in any design. |
| [`pptx-importer`](agent/pptx-importer/SKILL.md) | `.pptx` → deck in a chosen design; deck → `.pptx`. |
| [`design-author`](agent/design-author/SKILL.md) | Creates or extends design packs. |

Agents are design-agnostic: they read `designs/<id>/GUIDE.md` and `schemas/<id>.schema.json` for the rules.

## License

MIT
