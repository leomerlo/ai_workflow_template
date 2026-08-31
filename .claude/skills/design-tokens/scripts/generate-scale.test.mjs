// Zero-dependency tests using Node's built-in test runner (Node >= 18) —
// this template has no package.json/test framework of its own, so the script
// and its test stay runnable anywhere Node runs: `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STEPS,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  generateColorScale,
  isValidHex,
  toCssBlock,
} from './generate-scale.mjs';

test('hexToRgb parses 6-digit and 3-digit hex to the same 0-1 float triple', () => {
  assert.deepEqual(hexToRgb('#FF0000'), { r: 1, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('F00'), { r: 1, g: 0, b: 0 });
});

test('rgbToHsl -> hslToRgb round-trips back to the original color', () => {
  const original = hexToRgb('#7C3AED');
  const hsl = rgbToHsl(original);
  const roundTripped = hslToRgb(hsl);
  assert.equal(rgbToHex(roundTripped), rgbToHex(original));
});

test('generateColorScale produces all 11 steps, each a valid 6-digit hex', () => {
  const { scale } = generateColorScale('#7C3AED');
  assert.equal(Object.keys(scale).length, STEPS.length);
  for (const step of STEPS) {
    assert.match(scale[step], /^#[0-9A-F]{6}$/, `step ${step} should be a valid hex color`);
  }
});

test('the input color is placed exactly at its own anchor step, unmodified', () => {
  const input = '#7C3AED'; // L ~58% -> anchors at 500 per the lightness table
  const { scale, anchorStep } = generateColorScale(input);
  assert.equal(anchorStep, 500);
  assert.equal(scale[anchorStep], input.toUpperCase());
});

test('lightness decreases monotonically from step 50 (lightest) to step 950 (darkest)', () => {
  const { scale } = generateColorScale('#7C3AED');
  const lightnesses = STEPS.map((step) => rgbToHsl(hexToRgb(scale[step])).l);
  for (let i = 1; i < lightnesses.length; i++) {
    assert.ok(
      lightnesses[i] < lightnesses[i - 1],
      `step ${STEPS[i]} (L=${lightnesses[i].toFixed(1)}) should be darker than step ${STEPS[i - 1]} (L=${lightnesses[i - 1].toFixed(1)})`,
    );
  }
});

test('a very light input anchors at step 400, a very dark input anchors at step 700', () => {
  assert.equal(generateColorScale('#F5F0FF').anchorStep, 400); // near-white, high L
  assert.equal(generateColorScale('#1A0033').anchorStep, 700); // near-black, low L
});

test('isValidHex accepts 3- and 6-digit hex with or without #, rejects garbage', () => {
  assert.equal(isValidHex('#7C3AED'), true);
  assert.equal(isValidHex('7C3AED'), true);
  assert.equal(isValidHex('#ABC'), true);
  assert.equal(isValidHex('not-a-color'), false);
  assert.equal(isValidHex('#12345'), false);
});

test('toCssBlock emits one --color-{hue}-{step} custom property per step', () => {
  const { scale } = generateColorScale('#7C3AED');
  const css = toCssBlock('purple', scale);
  assert.match(css, /^:root \{\n/);
  for (const step of STEPS) {
    assert.ok(css.includes(`--color-purple-${step}: ${scale[step]};`), `missing custom property for step ${step}`);
  }
});
