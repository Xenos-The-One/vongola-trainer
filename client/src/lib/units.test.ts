import { describe, it, expect } from 'vitest';
import {
  kgToLb,
  lbToKg,
  toUnit,
  fromUnit,
  formatWeight,
  formatWeightWithUnit,
  defaultWeightStep,
} from './units';

describe('units conversion', () => {
  it('kg ↔ lb round-trips within rounding noise', () => {
    for (const kg of [0, 1, 22.5, 100, 225]) {
      expect(lbToKg(kgToLb(kg))).toBeCloseTo(kg, 6);
    }
  });

  it('100 kg ≈ 220.46 lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.46, 1);
  });

  it('toUnit/fromUnit are identity in kg, conversion in lb', () => {
    expect(toUnit(50, 'kg')).toBe(50);
    expect(fromUnit(50, 'kg')).toBe(50);
    expect(toUnit(50, 'lb')).toBeCloseTo(110.23, 1);
    expect(fromUnit(110.23, 'lb')).toBeCloseTo(50, 1);
  });
});

describe('formatWeight', () => {
  it('rounds kg to nearest 0.5', () => {
    expect(formatWeight(22.49, 'kg')).toBe('22.5');
    expect(formatWeight(22.24, 'kg')).toBe('22');
    expect(formatWeight(22.75, 'kg')).toBe('23'); // banker would round to 22.5, plain round goes to 23
  });

  it('rounds lb to nearest 1', () => {
    expect(formatWeight(100, 'lb')).toBe('220'); // 220.46 → 220
    expect(formatWeight(45.36, 'lb')).toBe('100'); // round-trip of "100 lb entered"
  });

  it('formatWeightWithUnit appends the suffix', () => {
    expect(formatWeightWithUnit(100, 'kg')).toBe('100kg');
    expect(formatWeightWithUnit(100, 'lb')).toBe('220lb');
  });
});

describe('defaultWeightStep', () => {
  it('matches the smallest plate pair for each unit', () => {
    expect(defaultWeightStep('kg')).toBe(2.5);
    expect(defaultWeightStep('lb')).toBe(5);
  });
});
