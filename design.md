# Design — LoopZ

A locked design system for the LoopZ MVP. Every route uses the same visual language; route-level variation comes from information density and workflow context, not from unrelated themes.

## Genre

Atmospheric, technical, restrained.

## Macrostructure family

- Marketing pages: Marquee Hero with a single monochrome loop-trace artefact and a narrative step sequence below the fold.
- App pages: Workbench with a compact workflow orientation layer, one focused decision surface, and evidence-first metadata.
- Content pages: Long Document with a readable single-column measure and negative-space section breaks.

## Theme

- `--color-paper`: `oklch(10.5% 0.006 265)`
- `--color-paper-2`: `oklch(14.5% 0.007 265)`
- `--color-paper-3`: `oklch(19% 0.008 265)`
- `--color-ink`: `oklch(96.5% 0.005 265)`
- `--color-ink-2`: `oklch(78% 0.006 265)`
- `--color-rule`: `oklch(27% 0.008 265)`
- `--color-accent`: `oklch(94% 0.006 265)`
- `--color-focus`: `oklch(82% 0.025 265)`
- `--color-brand`: `oklch(71.306% 0.1215 191.35)` (Tiffany Blue `#0ABAB5`, reserved for the LoopZ wordmark and identity details)

The product interface remains monochrome. Tiffany Blue is a tightly reserved brand accent for the LoopZ wordmark and identity details; it is not used for workflow state or broad surfaces. Error and warning tokens use only a trace tint and are always paired with text, symbols, or labels so state is never communicated by colour alone.

## Typography

- Display: Geist Sans, weight 700, roman.
- Body: Geist Sans, weight 400.
- Mono: Geist Mono, weight 500.
- Display tracking: `-0.045em`.
- Type scale anchor: `--text-display: clamp(3rem, 8vw, 5.5rem)`.

## Spacing

A named 4-point scale lives in `tokens.css`. Product code should prefer the named tokens over new raw spacing values.

## Motion

- Easings: exponential enter, accelerating exit, symmetric state toggle.
- Reveal pattern: one restrained opacity-and-translate entrance per view.
- Reduced-motion fallback: immediate state changes or opacity-only transitions no longer than 150 ms.

## Microinteractions stance

- Successful visible actions confirm in place; no celebratory toast.
- Buttons move by at most one pixel on hover or press.
- Copy actions replace their label with “Copied” feedback.
- Focus indicators appear immediately.
- Loading language names the work being performed.

## CTA voice

- Primary: light fill, dark ink, compact rectangular radius, specific verb.
- Secondary: transparent surface with a quiet rule.
- Destructive: text or outline treatment with an explicit consequence.

## Per-page allowances

- The homepage may use one Tier-A CSS loop trace.
- Workflow routes use no decorative enrichment; function carries the page.
- The About page is typography-only.

## What pages must share

- Top-left LoopZ wordmark and edge-aligned application navigation.
- Centred copyright footer.
- Monochrome palette, Geist typography, action hierarchy, form geometry, and focus language.
- Workflow progress semantics and evidence-boundary language.

## What pages may differ on

- Homepage composition, workflow density, and About-page reading measure.
- The amount of metadata visible at once.
- Desktop navigation aids that collapse to compact mobile context.

## Exports

### CSS

The canonical CSS export is `tokens.css` at the repository root.

### Tailwind v4 mapping

```css
@theme {
  --color-paper: oklch(10.5% 0.006 265);
  --color-ink: oklch(96.5% 0.005 265);
  --color-accent: oklch(94% 0.006 265);
  --font-display: var(--font-geist-sans);
  --font-body: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --spacing-md: 1rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG mapping

```json
{
  "color": {
    "paper": { "$value": "oklch(10.5% 0.006 265)", "$type": "color" },
    "ink": { "$value": "oklch(96.5% 0.005 265)", "$type": "color" },
    "accent": { "$value": "oklch(94% 0.006 265)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Geist Sans", "$type": "fontFamily" },
    "body": { "$value": "Geist Sans", "$type": "fontFamily" },
    "mono": { "$value": "Geist Mono", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1rem", "$type": "dimension" }
  }
}
```

### shadcn/ui mapping

```css
:root {
  --background: 10.5% 0.006 265;
  --foreground: 96.5% 0.005 265;
  --primary: 94% 0.006 265;
  --primary-foreground: 11% 0.006 265;
  --muted: 21% 0.008 265;
  --muted-foreground: 66% 0.006 265;
  --border: 27% 0.008 265;
  --input: 27% 0.008 265;
  --ring: 82% 0.025 265;
  --radius: 0.625rem;
}
```
