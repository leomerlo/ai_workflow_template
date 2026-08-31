#!/usr/bin/env node
// Generates an 11-step (50-950) color scale from one input hex, interpolated in HSL.
// Ported from the Brand->Alias->Mapped->Responsive Figma token generator's algorithm
// (github.com/ajaymongia/Design-System-Generator), adapted to plain hex/CSS output
// instead of Figma Variables — the math is stack-agnostic, only the target format changed.
//
// Usage: node generate-scale.mjs <hex> <hue-name>
//   node generate-scale.mjs "#7C3AED" purple
//
// Prints JSON to stdout: { hue, input, anchorStep, steps: { "50": "#...", ... }, css }

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Anchor: the input color is placed exactly at the step its own lightness implies,
// so a light brand color anchors light in the scale and a dark one anchors dark.
const ANCHOR_RULES = [
  { minL: 65, step: 400 },
  { minL: 45, step: 500 },
  { minL: 30, step: 600 },
  { minL: 0, step: 700 },
];

// Target lightness per step; every non-anchor step is interpolated against this
// curve, offset by how far the anchor's real lightness differs from the curve.
const LIGHTNESS_CURVE = {
  50: 94, 100: 88, 200: 78, 300: 66, 400: 54,
  500: 45, 600: 38, 700: 31, 800: 24, 900: 17, 950: 11,
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const bigint = parseInt(full, 16);
  return { r: ((bigint >> 16) & 255) / 255, g: ((bigint >> 8) & 255) / 255, b: (bigint & 255) / 255 };
}

function rgbToHsl({ r, g, b }) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
  const hh = h / 360, ss = s / 100, ll = l / 100;
  if (ss === 0) return { r: ll, g: ll, b: ll };
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return { r: hue2rgb(p, q, hh + 1 / 3), g: hue2rgb(p, q, hh), b: hue2rgb(p, q, hh - 1 / 3) };
}

function rgbToHex({ r, g, b }) {
  const c = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

// Desaturate at the extremes so the ramp doesn't look neon at 100 or muddy at 950.
function saturationFor(step, baseS) {
  if (step <= 100) return baseS * 0.75;
  if (step >= 900) return baseS * 0.9;
  return baseS;
}

function generateColorScale(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  let anchorStep = 700;
  for (const rule of ANCHOR_RULES) {
    if (hsl.l >= rule.minL) { anchorStep = rule.step; break; }
  }
  const anchorIndex = STEPS.indexOf(anchorStep);
  const lightnessOffset = hsl.l - LIGHTNESS_CURVE[anchorStep];

  // Raw target lightness per step from the curve + offset, before enforcing ordering.
  const rawL = STEPS.map((step) =>
    step === anchorStep ? hsl.l : Math.min(98, Math.max(2, LIGHTNESS_CURVE[step] + lightnessOffset * 0.15)),
  );

  // Enforce strictly decreasing lightness (step 50 lightest -> step 950 darkest),
  // radiating outward from the anchor, whose real lightness stays exact. The curve+offset
  // blend above can otherwise produce a local wobble right next to the anchor step.
  const clampedL = [...rawL];
  for (let i = anchorIndex - 1; i >= 0; i--) {
    clampedL[i] = Math.max(clampedL[i], clampedL[i + 1] + 0.5);
  }
  for (let i = anchorIndex + 1; i < clampedL.length; i++) {
    clampedL[i] = Math.min(clampedL[i], clampedL[i - 1] - 0.5);
  }

  const scale = {};
  STEPS.forEach((step, i) => {
    if (step === anchorStep) { scale[step] = rgbToHex(rgb); return; }
    scale[step] = rgbToHex(hslToRgb({ h: hsl.h, s: saturationFor(step, hsl.s), l: clampedL[i] }));
  });
  return { scale, anchorStep };
}

function isValidHex(hex) {
  return /^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(hex);
}

function toCssBlock(hueArg, scale) {
  const cssLines = STEPS.map((step) => `  --color-${hueArg}-${step}: ${scale[step]};`).join('\n');
  return `:root {\n${cssLines}\n}`;
}

export { STEPS, hexToRgb, rgbToHsl, hslToRgb, rgbToHex, generateColorScale, isValidHex, toCssBlock };

// CLI entry point — only runs when this file is executed directly, not when imported (e.g. by
// tests). Uses pathToFileURL rather than a manual `file://` template so paths with spaces or
// other characters that need percent-encoding still match import.meta.url correctly.
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , hexArg, hueArg] = process.argv;
  if (!hexArg || !hueArg) {
    console.error('Usage: node generate-scale.mjs <hex> <hue-name>');
    console.error('Example: node generate-scale.mjs "#7C3AED" purple');
    process.exit(1);
  }
  if (!isValidHex(hexArg)) {
    console.error(`Invalid hex color: ${hexArg}`);
    process.exit(1);
  }

  const { scale, anchorStep } = generateColorScale(hexArg);
  const css = toCssBlock(hueArg, scale);

  console.log(JSON.stringify({ hue: hueArg, input: hexArg.toUpperCase(), anchorStep, steps: scale, css }, null, 2));
}
