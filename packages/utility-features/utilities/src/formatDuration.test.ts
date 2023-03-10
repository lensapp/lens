/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";
import { formatDuration } from "./formatDuration";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const year = 365 * day;

describe("human format durations", () => {
  test("small duration should output something", () => {
    expect(formatDuration(1)).toBe("0s");
    expect(formatDuration(3)).toBe("0s");
  });

  test("returns seconds for duration under 1 min", () => {
    const res = formatDuration(8 * second);

    expect(res).toBe("8s");
  });

  test("zero duration should output something", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  describe("when compact is true", () => {

    test("duration under 3 hours return minutes", () => {
      const res = formatDuration(1 * hour + 35 * minute);

      expect(res).toBe("95m");
    });

    test("duration under 8 hours return hours and minutes", () => {
      const res = formatDuration(6 * hour + 15 * minute + 20 * second);

      expect(res).toBe("6h15m");
    });

    test("duration under 48 hours return hours", () => {
      const res = formatDuration(1 * day + 4 * hour + 15 * minute);

      expect(res).toBe("28h");
    });

    test("duration under 2 years return days", () => {
      const res = formatDuration(400 * day + 4 * hour + 15 * minute);

      expect(res).toBe("400d");
    });

    test("durations less than 8 years returns years and days", () => {
      const timeValue = new Date(2020, 0, 10, 12, 0, 0, 0).getTime() - new Date(2018, 0, 4, 12, 0, 0, 0).getTime();

      const res = formatDuration(timeValue);

      expect(res).toBe("2y5d");
    });

    test("durations more than 8 years returns years", () => {
      const timeValue = Date.now() - new Date(moment().subtract(9, "years").subtract(5, "days").toDate()).getTime();

      const res = formatDuration(timeValue);

      expect(res).toBe("9y");
    });

    test("durations more than 8 years returns years", () => {
      const res = formatDuration(10 * year + 25 * day);

      expect(res).toBe("10y");
    });
    test("durations shouldn't include zero magnitude parts", () => {
      const zeroSeconds = formatDuration(8 * minute);

      expect(zeroSeconds).toBe("8m");

      const zeroMinutes = formatDuration(8 * hour + 15 * minute);

      expect(zeroMinutes).toBe("8h");

      const zeroHours = formatDuration(6 * day + 2 * minute);

      expect(zeroHours).toBe("6d");

    });
  });

});
