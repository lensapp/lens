// Formatting date duration in shorten format, e.g. "2d", or "25m"

import moment from "moment";

export function formatDuration(timeValue: number, compact: boolean) {
  let result = "";
  const duration = moment.duration(timeValue);
  const suffixes = ["d", "h", "m"];
  const durationValues = [
    Math.round(duration.asDays()),
    duration.hours(),
    duration.minutes(),
  ];
  durationValues.forEach((value, index) => {
    if (value) result += value + suffixes[index] + " ";
  });
  if (compact) {
    result = result.split(" ")[0];
  }
  if (!result) {
    return "<1m";
  }
  return result;
}