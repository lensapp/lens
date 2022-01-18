/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper to convert memory from units Ki, Mi, Gi, Ti, Pi to bytes and vise versa

const base = 1024;
const suffixes = ["K", "M", "G", "T", "P", "E"]; // Equivalents: Ki, Mi, Gi, Ti, Pi, Ei

export function unitsToBytes(value: string) {
  if (!suffixes.some(suffix => value.includes(suffix))) {
    return parseFloat(value);
  }
 
  const suffix = value.replace(/[0-9]|i|\./g, "");
  const index = suffixes.indexOf(suffix);

  return parseInt(
    (parseFloat(value) * Math.pow(base, index + 1)).toFixed(1),
  );
}

export function bytesToUnits(bytes: number, precision = 1) {
  const sizes = ["B", ...suffixes];
  const index = Math.floor(Math.log(bytes) / Math.log(base));

  if (!bytes) {
    return "N/A";
  }

  if (index === 0) {
    return `${bytes}${sizes[index]}`;
  }

  return `${(bytes / (1024 ** index)).toFixed(precision)}${sizes[index]}i`;
}
