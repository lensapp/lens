/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import assert from "assert";
import { iter } from "./iter";
import { TypedRegEx } from "typed-regex";

// Helper to convert memory from units Ki, Mi, Gi, Ti, Pi to bytes and vise versa

const baseMagnitude = 1024;
const maxMagnitude = ["PiB", baseMagnitude ** 5] as const;
const magnitudes = new Map([
  ["B", 1] as const,
  ["KiB", baseMagnitude ** 1] as const,
  ["MiB", baseMagnitude ** 2] as const,
  ["GiB", baseMagnitude ** 3] as const,
  ["TiB", baseMagnitude ** 4] as const,
  maxMagnitude,
]);
const unitRegex = TypedRegEx("^(?<value>\\d+(\\.\\d+)?)\\s*(?<suffix>B|KiB|MiB|GiB|TiB|PiB)?$");

type BinaryUnit = typeof magnitudes extends Map<infer Key, any> ? Key : never;

export function unitsToBytes(value: string): number {
  const unitsMatch = unitRegex.captures(value.trim());

  if (!unitsMatch?.value) {
    return NaN;
  }

  const parsedValue = parseFloat(unitsMatch.value);

  if (!unitsMatch.suffix) {
    return parsedValue;
  }

  const magnitude = magnitudes.get(unitsMatch.suffix as BinaryUnit)
    ?? magnitudes.get(`${unitsMatch.suffix}B` as BinaryUnit);

  assert(magnitude, "UnitRegex is wrong some how");

  return parseInt((parsedValue * magnitude).toFixed(1));
}

export interface BytesToUnitesOptions {
  /**
   * The number of decimal places. MUST be an integer. MUST be in the range [0, 20].
   * @default 1
   */
  precision?: number;
}

export function bytesToUnits(bytes: number, { precision = 1 }: BytesToUnitesOptions = {}): string {
  if (bytes <= 0 || isNaN(bytes) || !isFinite(bytes)) {
    return "N/A";
  }

  const index = Math.floor(Math.log(bytes) / Math.log(baseMagnitude));
  const [suffix, magnitude] = iter.nth(magnitudes.entries(), index) ?? maxMagnitude;

  return `${(bytes / magnitude).toFixed(precision)}${suffix}`;
}
