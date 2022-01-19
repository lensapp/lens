/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper to convert CPU K8S units to numbers

const thousand = 1000;
const million = thousand * thousand;
const shortBillion = thousand * million;

export function cpuUnitsToNumber(cpu: string) {
  const cpuNum = parseInt(cpu);

  if (cpu.includes("m")) return cpuNum / thousand;
  if (cpu.includes("u")) return cpuNum / million;
  if (cpu.includes("n")) return cpuNum / shortBillion;

  return parseFloat(cpu);
}
