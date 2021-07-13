/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import moment from "moment";

/**
 * This function formats durations in a more human readable form.
 * @param timeValue the duration in milliseconds to format
 */
export function formatDuration(timeValue: number, compact = true) {
  const duration = moment.duration(timeValue, "milliseconds");
  const seconds = Math.floor(duration.asSeconds());
  const separator = compact ? "": " ";

  if (seconds < 0) {
    return "0s";
  } else if (seconds < 60*2 ) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(duration.asMinutes());

  if (minutes < 10) {
    const seconds = duration.seconds();

    return getMeaningfulValues([minutes, seconds], ["m", "s"], separator);
  } else if (minutes < 60 * 3) {
    if (!compact) {
      return getMeaningfulValues([minutes, duration.seconds()], ["m", "s"]);
    }

    return `${minutes}m`;
  }

  const hours = Math.floor(duration.asHours());

  if(hours < 8) {
    const minutes = duration.minutes();

    return getMeaningfulValues([hours, minutes], ["h", "m"], separator);
  } else if (hours < 48) {
    if (compact) {
      return `${hours}h`;
    } else {
      return getMeaningfulValues([hours, duration.minutes()], ["h", "m"]);
    }
  }

  const days = Math.floor(duration.asDays());

  if (days < 8) {
    const hours = duration.hours();

    if (compact) {
      return getMeaningfulValues([days, hours], ["d", "h"], separator);
    } else {
      return getMeaningfulValues([days, hours, duration.minutes()], ["d", "h", "m"]);
    }
  }
  const years = Math.floor(duration.asYears());

  if (years < 2) {
    if (compact) {
      return `${days}d`;
    } else {
      return getMeaningfulValues([days, duration.hours(), duration.minutes()], ["d", "h", "m"]);
    }
  } else if (years < 8) {
    const days = duration.days();

    if (compact) {
      return getMeaningfulValues([years, days], ["y", "d"], separator);
    }
  }

  if (compact) {
    return `${years}y`;
  }

  return getMeaningfulValues([years, duration.days(), duration.hours(), duration.minutes()], ["y", "d", "h", "m"]);
}

function getMeaningfulValues(values: number[], suffixes: string[], separator = " ") {
  return values
    .map((a, i): [number, string] => [a, suffixes[i]])
    .filter(([dur]) => dur > 0)
    .map(([dur, suf]) => dur + suf)
    .join(separator);
}
