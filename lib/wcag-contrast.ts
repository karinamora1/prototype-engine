/**
 * WCAG-inspired contrast utilities.
 * Primary and accent are used as backgrounds with white text. We target reasonable
 * readability with some wiggle room (min ratio ~3.5:1) rather than strict AA.
 */

/** Minimum contrast ratio with white — relaxed for wiggle room (strict AA would be 4.5). */
const MIN_CONTRAST_RATIO = 3.5;

/** Parse hex to 0–255 RGB. Returns null if invalid. */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace(/^#/, "").match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Relative luminance (0–1) per WCAG. */
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Contrast ratio between two luminances (1–21). */
function contrastRatio(L1: number, L2: number): number {
  const [light, dark] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * For a background color, return the best text color for accessibility:
 * white if it meets minRatio with the background, otherwise black.
 * Use this for accent backgrounds instead of modifying the accent color.
 */
export function getForegroundForBackground(
  bgHex: string,
  minRatio: number = MIN_CONTRAST_RATIO
): "#ffffff" | "#000000" {
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#ffffff";
  const Lbg = getLuminance(bgHex);
  const Lwhite = 1;
  const Lblack = 0;
  const ratioWithWhite = contrastRatio(Lwhite, Lbg);
  const ratioWithBlack = contrastRatio(Lbg, Lblack);
  if (ratioWithWhite >= minRatio) return "#ffffff";
  return "#000000";
}

/** Get relative luminance for a hex color (0–1). Returns 0 if invalid. */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return luminance(rgb[0], rgb[1], rgb[2]);
}

/** Get WCAG contrast ratio between two hex colors (1–21). */
export function getContrast(hex1: string, hex2: string): number {
  const L1 = getLuminance(hex1);
  const L2 = getLuminance(hex2);
  return contrastRatio(L1, L2);
}

/** Maximum luminance allowed for a background so that white (#ffffff) text meets minRatio. */
function maxLuminanceForWhiteText(minRatio: number): number {
  // contrast(white, bg) = (1.05) / (L_bg + 0.05) >= minRatio  =>  L_bg <= 1.05/minRatio - 0.05
  return 1.05 / minRatio - 0.05;
}

/** Darken a hex color by mixing with black. amount in 0–1 (0 = no change, 1 = black). */
function mixWithBlack(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((c) => Math.round(c * (1 - amount)));
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Ensure a background color has reasonable contrast with white text.
 * Uses a relaxed minimum ratio so we only darken when colors are quite light.
 */
export function ensureContrastWithWhite(
  hex: string,
  minRatio: number = MIN_CONTRAST_RATIO
): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  const L = getLuminance(hex);
  const maxL = maxLuminanceForWhiteText(minRatio);
  if (L <= maxL) return hex;
  // Binary search for mix amount so resulting luminance <= maxL
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const candidate = mixWithBlack(hex, mid);
    if (getLuminance(candidate) <= maxL) hi = mid;
    else lo = mid;
  }
  return mixWithBlack(hex, hi);
}

/**
 * Ensure a color used as background with white text has reasonable contrast.
 * Relaxed threshold for some wiggle room while still keeping colors readable.
 */
export function ensureWcagCompliantBackground(hex: string): string {
  return ensureContrastWithWhite(hex);
}
