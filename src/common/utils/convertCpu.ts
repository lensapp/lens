/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { TypedRegEx } from "typed-regex";

// Helper to convert CPU K8S units to numbers

const unitConverters = new Map([
  ["n", 1000 ** -3],
  ["u", 1000 ** -2],
  ["m", 1000 ** -1], // milli
  ["", 1000 ** 0], // no units
  ["k", 1000 ** 1],
  ["M", 1000 ** 2],
  ["G", 1000 ** 3],
  ["P", 1000 ** 4],
  ["T", 1000 ** 5],
  ["E", 1000 ** 6],
]);

const cpuUnitsRegex = TypedRegEx("^(?<digits>[+-]?[0-9.]+(e[-+]?[0-9]+)?)(?<unit>[EinumkKMGTP]*)$");

export function cpuUnitsToNumber(value: string) {
  const match = cpuUnitsRegex.captures(value);

  if (!match) {
    return undefined;
  }

  const { digits = "", unit } = match;
  const conversion = unitConverters.get(unit);

  if (conversion === undefined) {
    return undefined;
  }

  return parseFloat(digits) * conversion;
}
