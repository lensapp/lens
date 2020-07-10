const base = 1000;
const suffixes = ["k", "m", "g", "t", "q"];

export function compactedUnitsToNumber(value: string): number {
  const justLetters = value.toLowerCase().replace(/[0-9]\./g, '')[0];
  const index = suffixes.indexOf(justLetters);
  return parseInt(
    (parseFloat(value) * Math.pow(base, index + 1)).toFixed(1)
  )
}
