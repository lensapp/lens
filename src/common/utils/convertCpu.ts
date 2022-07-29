/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { TypedRegEx } from "typed-regex";

// Helper to convert CPU K8S units to numbers

const unitConverters = new Map([
  ["m", 1000 ** -1], // milli
  ["", 1000 ** 0], // no units
  ["k", 1000 ** 1],
  ["M", 1000 ** 2],
  ["G", 1000 ** 3],
  ["P", 1000 ** 4],
  ["T", 1000 ** 5],
  ["E", 1000 ** 6],
]);

const cpuUnitsRegex = TypedRegEx("^(?<digits>\\d+)(?<unit>.*)$");

export function cpuUnitsToNumber(value: string) {
  const match = cpuUnitsRegex.captures(value);

  if (!match) {
    return undefined;
  }

  const { digits, unit } = match;
  const convertion = unitConverters.get(unit);

  if (convertion === undefined) {
    return undefined;
  }

  return parseInt(digits) * convertion;
}
