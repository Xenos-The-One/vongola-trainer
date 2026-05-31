// Vongola Trainer — unit conversion + display helpers.
//
// Internal storage is ALWAYS kilograms. The user's display preference (kg or
// lb) is applied at the input/output boundary so:
//  - Old log entries keep meaning when the user switches units.
//  - The math (e1RM, volume, overload step) never branches on units.
//  - Round-trip kg → lb → kg loses < 0.01 kg, which we floor with display
//    precision so it never surfaces as flicker.

export type WeightUnit = 'kg' | 'lb';

const LB_PER_KG = 2.2046226218487757;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

/** Convert an internally-stored kg value into the user's chosen unit. */
export function toUnit(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}

/** Convert a user-typed value (in their chosen unit) back to kg for storage. */
export function fromUnit(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

/**
 * Format a kg-stored weight in the user's chosen unit with sensible precision:
 *  - kg → nearest 0.5 (smallest plate pair = 1.25kg, half = 0.625, round to 0.5)
 *  - lb → nearest 1 (smallest plate pair = 2.5lb, half = 1.25, round to 1)
 */
export function formatWeight(kg: number, unit: WeightUnit): string {
  const v = toUnit(kg, unit);
  const rounded = unit === 'kg' ? Math.round(v * 2) / 2 : Math.round(v);
  // Keep the kg version compact: "20" not "20.0", "22.5" not "22.50".
  return unit === 'kg' ? String(rounded) : String(rounded);
}

/** "100kg" / "220lb" — convenience for short readouts. */
export function formatWeightWithUnit(kg: number, unit: WeightUnit): string {
  return `${formatWeight(kg, unit)}${unit}`;
}

/** The double-progression step in the user's chosen unit (matches plate pairs). */
export function defaultWeightStep(unit: WeightUnit): number {
  return unit === 'kg' ? 2.5 : 5;
}
