const base = 1000;
const suffixes = ["k", "m", "g", "t", "q"];

export function metricUnitsToNumber(value: string): number {
  const suffix = value.toLowerCase().slice(-1);
  const index = suffixes.indexOf(suffix);
  return parseInt(
    (parseFloat(value) * Math.pow(base, index + 1)).toFixed(1)
  )
}
