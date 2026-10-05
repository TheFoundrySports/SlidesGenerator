# Extending Slide-Craft

> How to add new visual styles, shapes, and archetypes to the catechetical slide system without breaking the contract.

This document is the meta-guide. It assumes the v0.1.1 baseline (visual styles + shapes) is already in place. The baseline ships `monastic`/`festive`/`typographic` and `landscape-16:9`/`portrait-3:4`/`square-1:1`/`ultrawide-21:9`.

## Current state (as of v0.1.0)

- 8 archetypes: Cover, Scripture, Doctrine, Reflection, Prayer, Summary, Divider, Closing.
- 1 implicit visual style: `monastic`.
- 1 implicit shape: `landscape-16:9` (1920×1080).
- Lint enforces archetype rules + token palette; does not yet validate look/shape.
- Presenter scales 1920×1080 hardcoded.

## v0.1.1 axes

A slide is a triple `(content, look, shape)`:

| Axis | Declared via | Default if absent | Example |
|------|--------------|-------------------|---------|
| **Content archetype** | `class="slide slide--<name>"` and HTML structure | — | `slide--doctrine` |
| **Visual style** | `data-look` on `<html>` | `monastic` | `data-look="festive"` |
| **Shape** | `data-shape` on `<html>` | `landscape-16:9` | `data-shape="portrait-3:4"` |

Constraints: deck = one shape (mixed shapes per deck = P0). Styles have per-deck budgets. Not all (archetype × look) combinations are valid (P1 if not in the matrix).

---

## How to add a new visual style

Concrete example: adding `dense` for information-packed doctrine slides.

### 1. Define the style

Write this down **before** touching code. The spec drives every file you'll touch.

```
Name:        dense
Purpose:     when a slide packs a lot of information in a small canvas
Visual:      2-column doctrine list, larger numerals, 6 points max
Budget:      max 1 per deck
Valid pairs: Doctrine, Summary
```

If the spec is unclear, the rest will be unclear. Don't skip.

### 2. Create the CSS

`slides/_scaffold/_looks/dense.css`:

```css
/* ── Look: dense
 * Purpose: information-packed slides (doctrine grids, multi-point summaries)
 * Budget: 1 per deck
 * Valid archetypes: Doctrine, Summary */
.look-dense .stage { padding: 32px; }
.look-dense .doctrine-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 48px; max-width: 96ch; }
.look-dense .doctrine-list li { counter-increment: doctrine; margin-bottom: 0; }
.look-dense .doctrine-list li::before { font-size: var(--text-xl); }
```

**Never redefine tokens.** Only override what this style changes. Tokens live in the framework CSS at the top of every scaffold.

### 3. Add to the lint valid set

`scripts/lint-deck.js`:

```js
const VALID_LOOKS = new Set(['monastic', 'festive', 'typographic', 'dense']);
```

### 4. Update the combination matrix

Same file:

```js
const VALID_COMBINATIONS = {
  Cover:      ['monastic', 'festive'],
  Scripture:  ['monastic', 'typographic'],
  Doctrine:   ['monastic', 'dense'],          // add
  Reflection: ['monastic', 'typographic'],
  Prayer:     ['monastic', 'festive'],
  Summary:    ['monastic', 'dense'],          // add
  Divider:    ['monastic', 'festive'],
  Closing:    ['monastic', 'festive'],
};
```

If the style has a budget, add a check:

```js
function checkLookBudget(html, lookName, max) {
  // count slides where data-look="<lookName>" or class="look-<lookName>"
  // if > max, push { rule: 'look-budget', severity: 'P1', message: ... }
}
```

Wire it into `lintHtml()` near the other budget checks.

### 5. Document in SKILL.md

Two places (both must stay in sync):

- `agent/slide-craft/SKILL.md` (canonical for version control)
- `~/.pi/agent/skills/slide-craft/SKILL.md` (user-global install)

Add the new look to:
1. The "Visual styles" table.
2. The valid combinations matrix.
3. The self-check section (mention the budget).

### 6. Update the agent prompt

Two places (both must stay in sync):

- `agent/gentle-ai-slide-builder.md`
- `~/.pi/agent/agents/gentle-ai-slide-builder.md`

Update the style list and the workflow step that says "pick a look".

### 7. Add lint tests

`tests/lint-deck.test.js`:

```js
test('look dense: positive case (valid combination)', () => {
  const html = `<style>.stage{width:1920px;height:1080px}</style><html data-look="dense"><div class="stage"><section class="slide slide--doctrine" data-screen-label="x"></section></div></html><div class="counter"></div>`;
  const result = lintHtml('ok.html', html);
  assert.equal(result.issues.filter((i) => i.rule === 'look-valid').length, 0);
});

test('look dense: budget violation (2 slides, max 1)', () => {
  // 2 sections, both data-look="dense"
  // expect P1 from look-budget
});
```

### 8. Update fixtures (optional)

If the new look has visual rules worth verifying, add a slide using it to `tests/fixtures/deck-clean.html`. Add a budget-violation to `deck-bad.html`.

### 9. Run the verification gate

```bash
node --test
node scripts/lint-deck.js slides/_scaffold/
```

All green before committing.

### 10. Commit (work-unit)

```bash
git add slides/_scaffold/_looks/dense.css \
        scripts/lint-deck.js \
        tests/lint-deck.test.js \
        agent/slide-craft/SKILL.md \
        agent/gentle-ai-slide-builder.md

git commit -m "feat(slide-craft): add dense visual style (2-col doctrine/summary)"
```

Update `CHANGELOG.md` in the same commit if you want, or as a separate `docs` commit.

---

## How to add a new shape

Concrete example: adding `square-1:1` (which v0.1.1 already ships, but illustrates the pattern).

### 1. Define

- **Name**: `square-1:1`
- **Dimensions**: 1440 × 1440 px
- **Aspect**: 1:1
- **Use case**: Instagram, square card

### 2. Create CSS

`slides/_scaffold/_shapes/square-1-1.css`:

```css
/* ── Shape: square-1:1 — 1440×1440 (Instagram, card) */
.stage { width: 1440px; height: 1440px; }
```

### 3. Update presenter shape map

`presenter.js`:

```js
const SHAPE_DIMENSIONS = {
  'landscape-16:9': [1920, 1080],
  'portrait-3:4':   [1440, 1920],
  'square-1:1':     [1440, 1440],
  'ultrawide-21:9': [2520, 1080],
};
```

The presenter uses this map when scaling. If absent, the shape scales wrong.

### 4. Update lint

`scripts/lint-deck.js`:

```js
const VALID_SHAPES = new Set([
  'landscape-16:9', 'portrait-3:4', 'square-1:1', 'ultrawide-21:9',
]);
```

And update the stage-dimensions check to allow the new dimensions.

### 5. Document in SKILL.md

Add the new shape to the shapes table.

### 6. Commit

```bash
git add slides/_scaffold/_shapes/square-1-1.css \
        presenter.js \
        scripts/lint-deck.js \
        agent/slide-craft/SKILL.md

git commit -m "feat(slide-craft): add square-1:1 shape (1440×1440)"
```

---

## How to add a new archetype

This is the most invasive change. Archetypes are the "what" of the slide — adding one means changing the content model.

### 1. Define

- **Name**: e.g., `timeline`
- **Purpose**: e.g., "for lessons that walk through time (creation → covenant → Christ → eschaton)"
- **Layout**: HTML structure description
- **Allowed looks**: which styles pair well
- **Valid uses**: when to pick

### 2. Copy an existing scaffold as template

```bash
cp slides/_scaffold/03-doctrine.html slides/_scaffold/10-timeline.html
```

Edit:
- `data-screen-label` for the sample slide.
- Title in the `<h2>`.
- The body layout.
- The class on the section (`slide--timeline`).
- `<title>` in the head.

Keep the framework (head, fonts, tokens, scale-to-fit JS). Modify only the body section.

### 3. Update the combination matrix

`scripts/lint-deck.js`:

```js
const VALID_COMBINATIONS = {
  // ...existing...
  Timeline: ['monastic', 'festive'],
};
```

### 4. Update SKILL.md

Add the new archetype to:
1. The archetypes catalog.
2. The valid combinations matrix.
3. The default rhythm section.

### 5. Update the agent prompt

Both `agent/gentle-ai-slide-builder.md` and `~/.pi/agent/agents/gentle-ai-slide-builder.md`:

- Add the new archetype to the rhythm options.
- Mention the use case in the workflow.

### 6. Test

Build a sample deck using the new archetype. Run lint on it. Run the presenter on it.

### 7. Commit

Bump minor (v0.x.0 → v0.y.0), since adding an archetype changes the model.

```bash
git add slides/_scaffold/10-timeline.html \
        scripts/lint-deck.js \
        agent/slide-craft/SKILL.md \
        agent/gentle-ai-slide-builder.md \
        CHANGELOG.md

git commit -m "feat(slide-craft): add timeline archetype"
```

---

## Testing checklist (after any extension)

```bash
node --test                                    # all tests green
node scripts/lint-deck.js slides/_scaffold/   # scaffolds clean
node scripts/lint-deck.js <your-deck.html>     # your deck clean
./serve.sh                                      # manual: open in browser
```

## Version bump policy

| Change | Bump |
|--------|------|
| New visual style | patch (v0.1.1 → v0.1.2) |
| New shape | patch |
| New motif | patch |
| New archetype | minor (v0.1.x → v0.2.x) |
| New anti-pattern rule (P0) | patch |
| Breaking change to existing scaffolds | minor |

## Files that must stay in sync

The project has **two copies** of the agent definitions:

- `~/.pi/agent/skills/slide-craft/SKILL.md` — user-global install (live)
- `agent/slide-craft/SKILL.md` — project repo (canonical, version-controlled)

Whenever you update one, **mirror to the other** in the same commit. The project doc is the source of truth; the user-global install is what the agent reads at runtime.

A `scripts/install-agent.sh` script can automate the copy if this gets tedious:

```bash
#!/usr/bin/env bash
mkdir -p ~/.pi/agent/skills/slide-craft
cp agent/slide-craft/SKILL.md ~/.pi/agent/skills/slide-craft/SKILL.md
cp agent/gentle-ai-slide-builder.md ~/.pi/agent/agents/gentle-ai-slide-builder.md
```

(Suggested as a follow-up; not required for v0.1.1.)