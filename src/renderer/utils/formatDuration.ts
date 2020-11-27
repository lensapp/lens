import moment from "moment";

const suffixes = ["w", "d", "h", "m", "s"];

/**
 * This function formats durations in a more human readable form.
 * @param timeValue the duration in milliseconds to format
 * @param compact when true, only the largest non-zero time frame will be returned
 */
export function formatDuration(timeValue: number, compact: boolean) {
  const duration = moment.duration(timeValue, "milliseconds");
  const durationValues = [
    Math.floor(duration.asWeeks()),
    Math.floor(duration.asDays()) % 7,
    duration.hours(),
    duration.minutes(),
    duration.seconds(),
  ];

  const meaningfulValues = durationValues
    .map((a, i): [number, string] => [a, suffixes[i]])
    .filter(([dur]) => dur > 0)
    .filter(([, suf], i) => i === 0 || suf !== "s") // remove seconds, unless it is the only one
    .map(([dur, suf]) => dur + suf);

  if (meaningfulValues.length === 0) {
    return "0s";
  }

  if (compact) {
    return meaningfulValues[0];
  }

  return meaningfulValues.join(" ");
}
