# Catechism Liturgical — Design System

> Category: Vertical (Faith & Liturgy / Adult Catechesis)
> A restrained, parchment-toned design system for catechism and adult faith-formation slide decks. Built on the 1920×1080 fixed canvas. Single-ink discipline (deep oxblood on warm cream), serif throughout, with a small ornament vocabulary for cross, compass, and Trinity marks. Built to be reused: paste the scaffold, fill the archetypes, ship the deck.
>
> **Audience**: adults 30+, faith-formation groups, RCIA candidates, retreat use.
> **Canvas**: 1920×1080 fixed, scale-to-fit, no responsive variants.
> **Tone**: solemn, liturgical, monastic, devotional. Not promotional. Not playful.

---

## Read Order

1. This file — full system contract.
2. `tokens.css` (block below) — paste verbatim into the first `<style>` of every artifact.
3. `Layout Library` — pick the slide archetype you need; copy the scaffold.
4. `Decorative Motifs` — use sparingly; never more than two per slide.
5. `Self-check` — must all pass before emitting.

---

## 1. Visual Theme & Atmosphere

**Solemn. Liturgical. Monastic.** A single deep-oxblood ink on warm-cream parchment with a faint radial vignette — the visual register of an illuminated manuscript handed down for centuries, not a church-marketing flyer.

Decoration is restricted to **sacred geometry** (compass rose, Trinity knot, ichthys, alpha–omega, monogram cross). One ornament per slide at most; two only on slides where the ornament is the slide's whole point (a section-divider geometry).

What this system is not:

- Not children's ministry. Not Vacation Bible School. Not "fun and friendly church."
- Not evangelical megachurch stage design (no neon, no drop-shadows, no punchy gradients).
- Not Catholic "vintage kitsch" (no filigree clip-art, no photo-real saint portraits).
- Not generic web design (no sans-serif display, no rounded cards, no hover states).

The reader should feel they're holding a printed catechism, not a SaaS landing page.

---

## 2. Color Palette & Roles

The entire deck resolves from **seven tokens**: six semantic, one ornament gold. Every other color is forbidden inside the artifact.

| Role            | Token                | Hex       | OKLch                    | Use                                                                 |
|-----------------|----------------------|-----------|--------------------------|---------------------------------------------------------------------|
| Background      | `--bg`               | `#F5EBD9` | `oklch(92% 0.025 80)`    | Page canvas (gradient mesh applied via `.vignette`)                |
| Surface         | `--surface`          | `#EFE3CC` | `oklch(90% 0.030 78)`    | Inset well (callout box on doctrine / scripture slides)             |
| Foreground ink  | `--fg`               | `#5C1A1B` | `oklch(30% 0.090 25)`    | ALL text — titles, body, scripture, ornament strokes                |
| Muted           | `--muted`            | `#8A7560` | `oklch(50% 0.025 65)`    | Captions, references, slide counter                                 |
| Border          | `--border`           | `#B5A285` | `oklch(72% 0.030 75)`    | Hairline rules, callout boxes, separator lines                      |
| Accent (single) | `--accent`           | `#73201D` | `oklch(33% 0.085 25)`    | Reserved for the **one** decorative flourish that uses accent (rare) |
| Ornament gold   | `--gold`             | `#A8915C` | `oklch(65% 0.060 85)`    | ONLY inside the geometry motifs (compass rose, Trinity knot)        |

**Variant palettes** — the single-ink palette can be swapped for liturgical seasons. The token names stay; the values change.

| Season / feast      | `--fg` (ink)   | `--gold`      | Notes                                                |
|---------------------|----------------|---------------|------------------------------------------------------|
| Ordinary Time       | `#5C1A1B`      | `#A8915C`     | Default. Oxblood + ornament gold.                    |
| Advent / Lent       | `#4A1E5C`      | `#7A6A8A`     | Liturgical purple + muted amethyst.                  |
| Christmas / Easter  | `#7A5A1F`      | `#B8923A`     | Gold on cream — paschal, no oxblood.                 |
| Pentecost / martyrs | `#6E1A1A`      | `#8A6A4A`     | Sacred red on warm earth.                            |
| Marian feasts       | `#1F3F6E`      | `#A8915C`     | Marian blue on cream (gold unchanged).               |

**Hard rule**: at most ONE ink color per deck. Pick the season, swap `--fg` once, leave the rest alone.

### Background system

Every slide renders the same parchment field. Apply via the body / canvas — not per slide:

```css
.slide-canvas {
  background:
    radial-gradient(ellipse at center,
      oklch(94% 0.018 80) 0%,
      oklch(90% 0.030 78) 45%,
      oklch(82% 0.045 75) 100%);
}
```

The vignette is part of the system; don't replace it with a flat fill. Light comes from the upper-third center, deepens slightly at the corners.

---

## 3. Typography Rules

Serif throughout. Two family roles (display + body) pulled from the same lineage; the **mono** stack is reserved for catechism paragraph references and never used for prose.

### Font stacks

```css
--font-display: "Cormorant Garamond", "EB Garamond", "Iowan Old Style", "Charter", Georgia, serif;
--font-body:    "EB Garamond", "Lora", "Iowan Old Style", "Charter", Georgia, serif;
--font-mono:    "JetBrains Mono", ui-monospace, "IBM Plex Mono", Menlo, monospace;
```

Google Fonts link (include in `<head>` of every artifact):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type scale (px, at 1920×1080)

| Token              | Size | Use                                                  |
|--------------------|------|------------------------------------------------------|
| `--text-meta`      | 18   | Counter, footer refs (`.ccc-ref`, captions)           |
| `--text-sm`        | 22   | Marginalia, scripture citations, footnotes          |
| `--text-base`      | 28   | Body text default                                    |
| `--text-lg`        | 36   | Lead paragraphs, larger body                         |
| `--text-xl`        | 56   | Sub-headings, section markers                        |
| `--text-2xl`       | 80   | Slide titles                                         |
| `--text-3xl`       | 112  | Cover-only hero (single, restrained use)             |

- **Line-height**: `1.45` for body, `1.15` for headings.
- **Letter-spacing**: `-0.01em` on display sizes ≥ 80px (`h1` and above).
- **Italic**: reserved for scripture quotations and meditation; never for emphasis in body.
- **Weight**: titles in 600 (semibold). Body in 400. Never 800+ on liturgical content — visual shouting is wrong for this register.
- **Numerals**: `font-variant-numeric: tabular-nums lining-nums` everywhere numbers appear; this is a catechetical artifact, the reader is following list points.

### Voice typography

- Scripture quotations: italic (`<em>`), one paragraph block-ququote, citation underneath.
- Catechism references: mono small caps below the relevant phrase: `«...» (CEC 279, § 3)`.
- Spanish-only — see §7.

---

## 4. Slide Canvas — 1920 × 1080

**Non-negotiable**. The user standardizes this canvas for every catechetical deck.

- **Canvas**: exactly 1920 × 1080, scaled to fit the viewport via CSS `transform: scale()`.
- **Safe area**: 96 px margin on every edge (5% inset). No text crosses this.
- **Grid**: 12 columns, 160 px gutters. Two columns of 6 (split layouts), three columns of 4 (rare triplet), or one column of 12 (centered).
- **Vertical rhythm**: 8 px base unit; major sections separated by ≥ 96 px.
- **Slide counter**: bottom-right corner, 18 px, `--muted` color. Always visible.
- **Theme rhythm** — never three same-archetype slides in a row.

### Scale-to-fit framework

The framework is fixed and is the same for every catechism deck. Paste it verbatim; do not rewrite the scaling / keyboard / position logic.

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Curso de Catequesis — [Lecc. 01]</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ─── tokens.css (paste verbatim) ─────────────────────────────── */
:root {
  --bg:       #F5EBD9;
  --surface:  #EFE3CC;
  --fg:       #5C1A1B;
  --muted:    #8A7560;
  --border:   #B5A285;
  --accent:   #73201D;
  --gold:     #A8915C;

  --font-display: "Cormorant Garamond", "EB Garamond", "Iowan Old Style", "Charter", Georgia, serif;
  --font-body:    "EB Garamond", "Lora", "Iowan Old Style", "Charter", Georgia, serif;
  --font-mono:    "JetBrains Mono", ui-monospace, "IBM Plex Mono", Menlo, monospace;

  --text-meta: 18px;
  --text-sm:   22px;
  --text-base: 28px;
  --text-lg:   36px;
  --text-xl:   56px;
  --text-2xl:  80px;
  --text-3xl:  112px;

  --leading-body: 1.45;
  --leading-tight: 1.15;
  --tracking-display: -0.01em;

  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-12: 96px;
}
/* ─── end tokens.css ──────────────────────────────────────────── */

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: #0d0a08;
  font-family: var(--font-body);
  color: var(--fg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.deck {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.frame {
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  position: relative;
}

.slide {
  position: absolute;
  inset: 0;
  display: grid;
  padding: 96px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms ease;
  background:
    radial-gradient(ellipse at 50% 38%,
      oklch(94% 0.018 80) 0%,
      oklch(90% 0.030 78) 45%,
      oklch(82% 0.045 75) 100%);
}

.slide.is-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
}

.counter {
  position: absolute;
  bottom: 48px;
  right: 96px;
  font-family: var(--font-mono);
  font-size: var(--text-meta);
  color: var(--muted);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  z-index: 5;
}

</style>
<script>
/* scale-to-fit */
function scaleFrame() {
  const f = document.querySelector('.frame');
  const sx = window.innerWidth  / 1920;
  const sy = window.innerHeight / 1080;
  f.style.transform = `scale(${Math.min(sx, sy)})`;
}
window.addEventListener('resize', scaleFrame);
window.addEventListener('load', scaleFrame);

/* nav */
const slides = [...document.querySelectorAll('.slide')];
const counter = document.querySelector('.counter');
const key = sessionStorage.getItem('catechism-pos') || '0';
let i = parseInt(key, 10) || 0;
function show(n) {
  i = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
  counter.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  sessionStorage.setItem('catechism-pos', String(i));
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') show(i + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'PageUp')                   show(i - 1);
  if (e.key === 'Home') show(0);
  if (e.key === 'End')  show(slides.length - 1);
  if (/\d/.test(e.key) && e.key.length === 1) {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= slides.length) show(n - 1);
  }
});
show(i);
</script>
</head>
<body>
<div class="deck">
  <div class="frame">
    <!-- Slides go here -->
    <section class="slide is-active" data-screen-label="01 Portada">…</section>
    <section class="slide" data-screen-label="02 …">…</section>
    …
    <div class="counter">01 / NN</div>
  </div>
</div>
</body>
</html>
```

`data-screen-label` is required on every `<section class="slide">` — used by the host for slide referencing (e.g. "swap slide 03 image"). Labels must match the canonical archetype: `01 Portada`, `02 Cita bíblica`, `03 Doctrina`, `04 Reflexión`, `05 Oración`, `06 Cierre`, etc.

**Do not** invent your own scale-to-fit math. **Do not** add `scrollIntoView`. **Do not** expose prev/next as buttons in the final artifact (keyboard is sufficient — buttons are demo chrome).

---

## 5. Component Stylings

These are the recurring, repeatable shapes. Use only what's listed; do not invent new components for individual decks.

### Slide container
The entire 1920×1080 grid. All children are positioned within `.slide` (already styled in the framework above).

### Headings & body

```css
.slide h1 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-2xl);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
  color: var(--fg);
  text-align: center;
}

.slide h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xl);
  line-height: var(--leading-tight);
  color: var(--fg);
}

.slide p {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--fg);
  text-wrap: pretty;
}

.slide em { font-style: italic; }                       /* scripture */
.slide em.scripture {                                 /* scripture passage block */
  display: block;
  font-family: var(--font-body);
  font-style: italic;
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--fg);
  text-align: center;
  max-width: 64ch;
  margin-inline: auto;
}

.scripture-ref {                                      /* citation footer */
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--muted);
  text-align: center;
  display: block;
  margin-top: var(--space-3);
  letter-spacing: 0.02em;
}

.ccc-ref {                                            /* Catechism paragraph reference */
  font-family: var(--font-mono);
  font-size: var(--text-meta);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
```

### Callout box (doctrinal aside / scripture citation pedestal)

```css
.callout {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-body);
  color: var(--fg);
  max-width: 56ch;
  text-align: center;
  margin-inline: auto;
}
```

### Pull-quote / reflection block

```css
.reflection {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
  font-size: var(--text-xl);
  line-height: 1.4;
  color: var(--fg);
  text-align: center;
  max-width: 28ch;
  margin-inline: auto;
}
```

### Hairline rule (separator)

```css
.rule {
  width: 240px;
  height: 1px;
  background: var(--border);
  border: 0;
  margin: var(--space-3) auto;
}
```

### Ornament container

```css
.ornament {
  display: grid;
  place-items: center;
  color: var(--gold);              /* ornament strokes use --gold */
}
.ornament--ink { color: var(--fg); } /* for monogram-cross etc. that read in ink */
.ornament svg {
  width: 200px;
  height: 200px;
  display: block;
}
```

### Slide counter (already in framework)

`mono, 18px, muted, bottom-right`. Do not restyle per slide.

---

## 6. Layout Library — Slide Archetypes

Pick the archetype, copy the scaffold, fill the bracketed `[…]` slots. **Never** write freeform slide layouts — every catechetical deck is a sequence of these archetypes plus a few ornamental dividers.

Mix rhythm: **cover → scripture → doctrine → reflection → prayer → summary → closing**. Two slides same-archetype in a row is fine once; three is not.

### A. Cover — `01 Portada`

**When**: opens every deck, every chapter, every lesson.
**Composition**: centered monogram or name of lesson above the title; one centered title; one centered subtitle / course name; no body text; soft ornament above.

```html
<section class="slide is-active" data-screen-label="01 Portada">
  <div class="ornament" style="position:absolute; top:160px; left:50%; transform:translateX(-50%);">
    <!-- one ornament, paste from §7 -->
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <!-- compass rose / trinity knot / monogram cross etc. -->
    </svg>
  </div>
  <header style="margin:auto;">
    <h1 style="font-size:var(--text-3xl); max-width:14ch; margin-inline:auto;">[Lecc. 01 — Título de la lección]</h1>
    <p style="text-align:center; font-family:var(--font-body); font-size:var(--text-lg); color:var(--muted); margin-top:var(--space-3);">
      Curso de Catequesis · [Nombre del curso]
    </p>
  </header>
  <p style="position:absolute; bottom:96px; left:0; right:0; text-align:center; font-family:var(--font-display); font-style:italic; font-size:var(--text-sm); color:var(--muted);">
    En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.
  </p>
</section>
```

### B. Scripture — `02 Cita bíblica`

**When**: a single passage is the substance of the slide (a Lectio moment, a CCC citation).
**Composition**: reference at top, the passage in italic serif center, citation below. Nothing else.

```html
<section class="slide" data-screen-label="02 Cita bíblica">
  <p class="scripture-ref" style="position:absolute; top:120px; left:0; right:0;">[Génesis 1, 1 — 3]</p>
  <blockquote class="scripture" style="margin:auto; max-width:32ch;">
    [«En el principio creó Dios el cielo y la tierra.
    La tierra era caos y vacía; las tinieblas cubrían la superficie del abismo,
    y el espíritu de Dios se movía sobre las aguas.»]
  </blockquote>
  <p class="scripture-ref" style="position:absolute; bottom:140px; left:0; right:0;">
    Biblia de Jerusalén · [Libro capítulo, versículo]
  </p>
</section>
```

### C. Doctrine — `03 Doctrina`

**When**: teaching moment — the Catechism paragraph that closes the lesson.
**Composition**: 3 – 5 doctrinal points in centered column, optional CCC paragraph reference below, optional iconography on left or right.

```html
<section class="slide" data-screen-label="03 Doctrina">
  <header style="grid-row:1; align-self:end; text-align:center;">
    <h2 style="font-size:var(--text-2xl);">[Dios Padre, Creador]</h2>
  </header>
  <ol style="grid-row:2; max-width:28ch; margin:auto; counter-reset:doctrine; list-style:none; padding:0;">
    <li style="counter-increment:doctrine; margin-bottom:var(--space-3); font-family:var(--font-body); font-size:var(--text-base); line-height:var(--leading-body);">
      <span style="font-family:var(--font-mono); color:var(--gold); margin-right:var(--space-2);">I.</span>
      [Creemos en un solo Dios, Padre, Hijo y Espíritu Santo.]
    </li>
    <li style="counter-increment:doctrine; margin-bottom:var(--space-3);">
      <span style="font-family:var(--font-mono); color:var(--gold); margin-right:var(--space-2);">II.</span>
      [Este Dios único crea todas las cosas por su Verbo.]
    </li>
    <li style="counter-increment:doctrine; margin-bottom:var(--space-3);">
      <span style="font-family:var(--font-mono); color:var(--gold); margin-right:var(--space-2);">III.</span>
      [La creación es obra de su amor y de su providencia.]
    </li>
    <li style="counter-increment:doctrine;">
      <span style="font-family:var(--font-mono); color:var(--gold); margin-right:var(--space-2);">IV.</span>
      [El hombre es la cima de la obra creada, llamado a la comunión con Dios.]
    </li>
  </ol>
  <p class="ccc-ref" style="position:absolute; bottom:120px; left:0; right:0; text-align:center;">
    CEC 279 · LG 2 · SC 38
  </p>
</section>
```

### D. Reflection — `04 Reflexión`

**When**: meditation moment — quiet space for the reader to sit with one sentence.
**Composition**: a single meditative sentence, in display-italic at large scale; one attribution at the bottom.

```html
<section class="slide" data-screen-label="04 Reflexión">
  <p class="reflection" style="margin:auto;">
    [«Antes de que la luz fuera luz, ya eras Tú.
    El primer verbo no fue "hágase": fuiste Tú, diciéndote a Ti mismo, Amor.»]
  </p>
  <p class="scripture-ref" style="position:absolute; bottom:120px; left:0; right:0;">
    — [Adaptado de una homilía de San Agustín]
  </p>
</section>
```

### E. Prayer — `05 Oración`

**When**: full prayer text presented to the assembly (Padre Nuestro, Credo, Salmo, oración litúrgica).
**Composition**: title centered top, prayer body centered, single «Amén.» footer.

```html
<section class="slide" data-screen-label="05 Padre Nuestro">
  <header style="grid-row:1; align-self:end; text-align:center;">
    <h2 style="font-size:var(--text-2xl);">Padre Nuestro</h2>
  </header>
  <div class="prayer" style="grid-row:2; margin:auto; max-width:46ch; text-align:center; font-family:var(--font-body); font-size:var(--text-lg); line-height:1.6;">
    [Padre nuestro, que estás en el cielo,<br>
    santificado sea tu Nombre;<br>
    venga a nosotros tu reino;<br>
    hágase tu voluntad en la tierra como en el cielo.<br><br>
    Danos hoy nuestro pan de cada día;<br>
    perdona nuestras ofensas,<br>
    como también nosotros perdonamos a los que nos ofenden;<br>
    no nos dejes caer en tentación,<br>
    y líbranos del mal.]
  </div>
  <p style="position:absolute; bottom:120px; left:0; right:0; text-align:center; font-family:var(--font-display); font-style:italic; font-size:var(--text-lg); color:var(--fg);">Amén.</p>
</section>
```

### F. Summary — `06 Resumen`

**When**: lessons end with a numbered recap.
**Composition**: 3 – 5 numbered takeaways, column-centered, sized for distance-reading.

```html
<section class="slide" data-screen-label="06 Resumen">
  <header style="text-align:center; margin-bottom:var(--space-6);">
    <h2 style="font-size:var(--text-2xl);">En resumen</h2>
  </header>
  <ol style="max-width:30ch; margin:auto; list-style:none; padding:0; counter-reset:r;">
    <li style="counter-increment:r; margin-bottom:var(--space-3); font-family:var(--font-body); font-size:var(--text-lg); line-height:1.4; display:grid; grid-template-columns:48px 1fr; gap:var(--space-2);">
      <span style="font-family:var(--font-display); font-weight:600; font-size:var(--text-xl); color:var(--gold);">1.</span>
      [Dios Padre es el principio sin principio de todas las cosas.]
    </li>
    <li style="counter-increment:r; margin-bottom:var(--space-3); font-family:var(--font-body); font-size:var(--text-lg); line-height:1.4; display:grid; grid-template-columns:48px 1fr; gap:var(--space-2);">
      <span style="font-family:var(--font-display); font-weight:600; font-size:var(--text-xl); color:var(--gold);">2.</span>
      [Crea por amor, no por necesidad.]
    </li>
    <li style="counter-increment:r; font-family:var(--font-body); font-size:var(--text-lg); line-height:1.4; display:grid; grid-template-columns:48px 1fr; gap:var(--space-2);">
      <span style="font-family:var(--font-display); font-weight:600; font-size:var(--text-xl); color:var(--gold);">3.</span>
      [Su providencia sostiene lo creado hacia su plenitud.]
    </li>
  </ol>
</section>
```

### G. Section divider — `00 Separador`

**When**: a quiet moment between sub-lessons; never between two slides of the same type.
**Composition**: nothing but the centered ornament and a single sub-chapter mark.

```html
<section class="slide" data-screen-label="07 Separador">
  <div class="ornament" style="margin:auto;">
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <!-- one ornament, paste from §7 -->
    </svg>
  </div>
  <p style="position:absolute; bottom:96px; left:0; right:0; text-align:center; font-family:var(--font-mono); font-size:var(--text-sm); color:var(--muted); letter-spacing:0.16em;">
    II · LA CREACIÓN
  </p>
</section>
```

### H. Closing blessing — `99 Cierre`

**When**: ends every deck or chapter — never used as a body slide.
**Composition**: a single line of exhortation; centered ornament above; «Amén.» at the bottom.

```html
<section class="slide" data-screen-label="99 Cierre">
  <div class="ornament" style="position:absolute; top:200px; left:50%; transform:translateX(-50%);">
    <!-- monogram cross -->
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <path d="M50 18 L50 82 M28 38 L72 38"/>
    </svg>
  </div>
  <p style="margin:auto; max-width:32ch; font-family:var(--font-display); font-style:italic; font-size:var(--text-xl); line-height:1.45; text-align:center;">
    [«El Señor os bendiga y os guarde;<br>
    haga resplandecer su rostro sobre vosotros<br>
    y os conceda su paz.»]
  </p>
  <p style="position:absolute; bottom:96px; left:0; right:0; text-align:center; font-family:var(--font-display); font-style:italic; font-size:var(--text-lg); color:var(--fg);">Amén.</p>
</section>
```

---

## 7. Decorative Motifs Library

Use **at most two motifs per slide**, and **the motif must be on a slide whose content is itself quiet or empty** (cover, separator, closing, reflection). Never on a doctrine / summary slide — those are information-dense.

All motifs are inline SVG. They share the same 100×100 viewBox and a `currentColor` stroke — that means the slide's `.ornament` class controls the color (ink or gold).

### Monogram cross
For covers, closings, separators.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
  <path d="M50 16 L50 84 M28 38 L72 38"/>
</svg>
```

### Compass rose (Providence)
For doctrine/Providence slides, sparingly.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
  <circle cx="50" cy="50" r="32" stroke-width="0.8"/>
  <circle cx="50" cy="50" r="22" stroke-width="0.6"/>
  <path d="M50 18 L55 50 L50 82 L45 50 Z"/>
  <path d="M18 50 L50 45 L82 50 L50 55 Z"/>
  <path d="M50 18 L50 82 M18 50 L82 50"/>
</svg>
```

### Trinity knot
For Trinitarian doctrine / closing on Trinity Sunday.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
  <circle cx="42" cy="40" r="22"/>
  <circle cx="58" cy="40" r="22"/>
  <circle cx="50" cy="62" r="22"/>
</svg>
```

### Ichthys (fish)
For baptismal / creed themes.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
  <path d="M14 50 Q14 30 50 30 Q86 30 86 50 Q86 70 50 70 Q14 70 14 50 Z"/>
  <path d="M86 50 L96 38 M86 50 L96 62"/>
</svg>
```

### Alpha–omega
For Christological / eschatological themes.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
  <text x="20" y="62" font-family="serif" font-size="32" font-style="italic" fill="currentColor" stroke="none">A</text>
  <text x="60" y="62" font-family="serif" font-size="32" font-style="italic" fill="currentColor" stroke="none">Ω</text>
  <path d="M50 30 L50 38"/>
</svg>
```

### Rule-and-dot ornament
For the bottom of a section divider — single decorative mark.

```html
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
  <path d="M10 50 L40 50"/>
  <path d="M60 50 L90 50"/>
  <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none"/>
</svg>
```

**Never** use these motifs:
- Haloed clip-art saints
- Photo-real angels / lambs
- Latin abbreviations outside of catechism references
- Any emoji other than ✝ (the single allowed cross character, used at most once per deck)

---

## 8. Voice & Copy Rules

**Language**: Spanish (es-AR neutral, no voseo — catechetical register). English only if explicitly requested.

**Cite scripture** with the standard Spanish Catholic format:

> *[Libro abreviado] [capítulo]:[versículo(s)]*
> Ej.: Génesis 1, 1 — 3  ·  Juan 3, 16  ·  Mateo 28, 19

**Cite the Catechism** with `CEC N` (Catecismo de la Iglesia Católica paragraph number):

> `[oración doctrinal]. (CEC 279)` — placed at the end of the sentence, period inside.
> Multiple references: `(CEC 279; 295; SC 38)` separated by semicolons.

**Quote marks**: use Spanish angular `« »` for any quotation. Scripture and prayers use these.

**Dates**: Do not include dates. The catechetical register is timeless; the artifact should not feel like a 2026 product.

**Lectionary tones**: keep doctrinal sentences declarative, not exclamatory. Avoid evangelical intensity. The voice is monastic, not enthusiastic.

| Avoid                                  | Use                                            |
|----------------------------------------|------------------------------------------------|
| "¡Dios te ama muchísimo!"             | "Dios te ama."                                 |
| "Hoy aprenderás algo increíble"       | "Consideremos hoy la obra creadora."           |
| "El plan perfecto de Dios para ti"     | "El designio providente de Dios."              |
| Marketing-style subhead "Ahora bien…"  | Doctrinal linkers: "En efecto…", "Pues…"       |

**Filler**: never use `Feature One / Feature Two / Description Three`. The catechetical register is content-rich; if a slot feels empty, you need a different archetype, not placeholder text.

**Placeholders**: when content is TBD, render a quiet dashed-out box with a short caption (`«[Insertar cita bíblica]»`), never `Lorem ipsum`.

---

## 9. Hard Rules (anti-patterns)

These are **non-negotiable**. A slide that violates any P0 fails the gate and must be re-emitted.

### P0 — never

- ❌ Sans-serif display fonts (Inter, Roboto, Arial, Montserrat…) anywhere as a *heading*. Body in sans is also disallowed — this system is **serif throughout**.
- ❌ Emoji in body (the lone exception is the cross character `✝`, used at most once per deck, usually on the cover).
- ❌ Drop shadows, glow, or blur on text. The parchment + ink system needs no shadow.
- ❌ Bright or neon colors (luminescents, electric blues, hot pinks). Single ink only.
- ❌ Gradients on text, icons, or backgrounds other than the parchment vignette.
- ❌ Multiple competing accent colors on the same slide (or across the same deck — pick the season, commit).
- ❌ Cartoon, illustrated, or photographic content. Geometric line ornaments only.
- ❌ Inline `<img src="https://…">` links to stock photos or generated images — every visual must be SVG ornament or solid color.
- ❌ Buttons, search boxes, settings panels, theme knobs, viewport toggles, "demo controls", or any product UI chrome on a catechism slide. The reader is in a chapel, not on a SaaS landing.
- ❌ More than two ornamental motifs on a slide.
- ❌ `scrollIntoView`. (Slides don't scroll — the framework handles navigation.)
- ❌ Invented metrics ("10× faster", "99.9% uptime"). These are catechism artifacts — there are no KPIs.
- ❌ Lorem ipsum, "Feature One", "Description Two", or any other generic placeholder text.
- ❌ Animations between slides other than the framework's 280 ms cross-fade.
- ❌ Auto-play, sound, video, or any `<video>` / `<audio>` element.
- ❌ Using the Word "Amén." mid-slide as a CTA. It belongs only on prayer / closing / cover slides.

### P1 — avoid unless justified

- ⚠ Plain (non-vignetted) flat background — only acceptable if explicitly requested.
- ⚠ Color tokens overridden mid-deck — pick the season once.
- ⚠ Type weight 700+ on anything but the cover slide title.
- ⚠ Footer with the deck's date, version, or author watermark. The artifact is timeless; none of this belongs.
- ⚠ More than 5 doctrinal points per slide —split into a doctrine + summary pair.

### P2 — bonus

- ⭐ A subtle parchment-grain texture as a CSS `background-image: linear-gradient(…noise…)` overlay, kept below 5% contrast.
- ⭐ Italic pastoral voice in the reflection archetype.
- ⭐ Use of `data-screen-label` for every section so the host can target slides by name.

---

## 10. Self-Check before Ship

Walk this list top-down. Every P0 must pass; P1 should pass; P2 are bonus. If any P0 fails, fix the slide, do not emit.

- [ ] **Background**: parchment radial vignette is present on every `.slide` (not a flat fill).
- [ ] **Ink discipline**: all text and ornament strokes resolve to one of the seven tokens. No raw hex inside component CSS.
- [ ] **Display serif**: every `<h1>` / `<h2>` uses `--font-display`. No sans-serif headings.
- [ ] **Body serif**: every `<p>` uses `--font-body`. No sans-serif body.
- [ ] **Size minimums**: titles ≥ 56 px, body ≥ 28 px, captions ≥ 22 px, counter 18 px. Nothing smaller.
- [ ] **Single ink**: at most one foreground color across the deck. Confirm after a visual scan.
- [ ] **Motif discipline**: ≤ 2 motifs on any single slide. Confirm by grep on the SVG count per section.
- [ ] **Counter visible**: `.counter` element present in every deck at bottom-right.
- [ ] **No demo chrome**: zero buttons, zero settings panels, zero toggles, zero slide selectors. Keyboard only.
- [ ] **No emoji in body**: grep for emoji in raw text. The cross `✝` may appear exactly once on a single slide.
- [ ] **Scripture citation**: every scripture block includes a Spanish citation footer (`Libro cap, vv`).
- [ ] **CCC reference**: every doctrinal point with a Catechism basis cites a paragraph; type is mono and `--muted`.
- [ ] **`data-screen-label`**: every `<section class="slide">` has it.
- [ ] **Theme rhythm**: no three same-archetype slides in a row.
- [ ] **No invented content**: every quoted scripture, every paragraph number is from an authoritative source. If unsure, leave a `[Cita pendiente]` marker, never invent.
- [ ] **Print-safe**: the artifact must remain legible when printed at A3 landscape. Test mentally: would this slide hold up read aloud in a chapel?

---

## 11. Generation Workflow

Use this sequence every time you generate a new catechism deck from this system.

1. **Lock the brief**: which lesson, which season, which audience sub-group. Confirm with the user before opening any file.
2. **Pick the season palette** from §2 if not Ordinary Time. Swap `--fg` and `--gold` once.
3. **Plan the slide list** before touching any HTML — declare the sequence using the archetypes (A–H). Confirm rhythm:
   - Default rhythm for a 12-lesson deck: `Cover · Scripture · Doctrine · Reflection · Summary · Closing`, with separators and prayers as connective tissue.
4. **Copy the framework** from §4 verbatim into a new file `lessons/[lesson-id].html` (or `index.html` for one-shot decks). Do not invent your own scale-to-fit math.
5. **Paste `tokens.css`** from §2 into the first `<style>` block. Bind the seven tokens; do not redefine them.
6. **Fill the slots**: go archetype-by-archetype. Replace every `[…]` with real, sourced catechetical content.
7. **Apply motifs** from §7 only where the archetype invites a quiet visual moment (cover, separator, closing, reflection).
8. **Self-check** §10 from top to bottom. Fix any P0 before moving on.
9. **Voice critique**: re-read every slide aloud. Does it sound like a printed catechism, not a SaaS deck? If it sounds like marketing, rewrite the copy.
10. **Emit**: wrap the artifact in `<artifact>` and stop. No narration.

A slide that fails the self-check or the voice critique is not shipped. Iterate; do not rationalize.

---

## 12. Quick Reference — the Seven Tokens

```css
:root {
  --bg:       #F5EBD9;   /* parchment center */
  --surface:  #EFE3CC;   /* callout well */
  --fg:       #5C1A1B;   /* oxblood ink — every text element */
  --muted:    #8A7560;   /* captions, counter, refs */
  --border:   #B5A285;   /* hairline rules */
  --accent:   #73201D;   /* reserved single-accent use */
  --gold:     #A8915C;   /* ornament strokes only */
}
```

One ink. One ornament. One voice. No more.

---

*Ad Majorem Dei Gloriam.*
