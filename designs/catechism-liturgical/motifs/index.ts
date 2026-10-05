/**
 * Inline SVG motifs. All share a 100x100 viewBox and `currentColor` strokes, so the slide's
 * `.ornament` color (ink or gold) decides how they read. See DESIGN.md §7.
 */
const svg = (inner: string, strokeWidth = 1.4) =>
  `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const MOTIFS = {
  cross: svg('<path d="M50 16 L50 84 M28 38 L72 38"/>'),
  compass: svg(
    '<circle cx="50" cy="50" r="32" stroke-width="0.8"/><circle cx="50" cy="50" r="22" stroke-width="0.6"/><path d="M50 18 L55 50 L50 82 L45 50 Z"/><path d="M18 50 L50 45 L82 50 L50 55 Z"/><path d="M50 18 L50 82 M18 50 L82 50"/>',
    1.2,
  ),
  trinity: svg('<circle cx="42" cy="40" r="22"/><circle cx="58" cy="40" r="22"/><circle cx="50" cy="62" r="22"/>'),
  // Two arcs from the nose that cross and run on as the tail (the classic sign, not a closed oval).
  ichthys: svg('<path d="M8 50 Q40 22 72 50 L92 72"/><path d="M8 50 Q40 78 72 50 L92 28"/>'),
  "alpha-omega": svg(
    '<text x="30" y="62" text-anchor="middle" font-family="serif" font-size="32" font-style="italic" fill="currentColor" stroke="none">A</text><text x="70" y="62" text-anchor="middle" font-family="serif" font-size="32" font-style="italic" fill="currentColor" stroke="none">Ω</text>',
  ),
  "rule-and-dot": svg('<path d="M10 50 L40 50"/><path d="M60 50 L90 50"/><circle cx="50" cy="50" r="3" fill="currentColor" stroke="none"/>', 1),
  // Small concept glyphs for doctrine headers.
  dove: svg('<path d="M20 58 Q50 30 80 58 Q50 72 20 58 Z"/><path d="M80 58 L92 52"/><path d="M34 50 Q22 36 12 28 M46 44 Q36 28 30 16"/>'),
  "chi-rho": svg('<path d="M50 14 L50 86"/><path d="M50 14 Q74 14 74 32 Q74 50 50 50"/><path d="M28 56 L72 86 M72 56 L28 86"/>'),
  heart: svg('<path d="M50 80 C20 58 14 38 28 28 C38 22 46 28 50 36 C54 28 62 22 72 28 C86 38 80 58 50 80 Z"/><path d="M50 44 L50 64 M42 54 L58 54"/>'),
  crown: svg('<path d="M18 72 L18 40 L36 56 L50 30 L64 56 L82 40 L82 72 Z"/><path d="M18 82 L82 82"/>'),
  "rays-up": svg('<path d="M50 38 L76 76 L24 76 Z"/><path d="M36 26 L36 14 M50 22 L50 8 M64 26 L64 14"/>'),
  "rays-down": svg('<path d="M50 62 L24 24 L76 24 Z"/><path d="M36 74 L36 86 M50 78 L50 92 M64 74 L64 86"/>'),
  flame: svg('<path d="M50 12 C62 32 74 44 70 64 C68 78 58 86 50 86 C42 86 32 78 30 64 C28 52 38 46 42 34 C46 42 48 40 50 12 Z"/>'),
} as const;

export type MotifName = keyof typeof MOTIFS;
export const MOTIF_NAMES = Object.keys(MOTIFS) as [MotifName, ...MotifName[]];
