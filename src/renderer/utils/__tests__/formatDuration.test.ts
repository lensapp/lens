import { formatDuration } from "../formatDuration";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

describe("human format durations", () => {
  test("long formatted durations less than 24 hours long shouldn't have a 'd' component", () => {
    const res = formatDuration(19 * 60 * 60 * 1000, false);

    expect(res).not.toContain("d");
    expect(res).toBe("19h");
  });

  test("long formatted durations more than a week have correct day count", () => {
    const res = formatDuration(2 * week + 2 * day, false);

    expect(res).toBe("2w 2d");
  });

  test("durations > 1/2 week shouldn't show 1w has passed", () => {
    const res = formatDuration(5 * 24 * 60 * 60 * 1000, false);

    expect(res).not.toContain("w");
    expect(res).toBe("5d");
  });

  test("durations shouldn't include zero magnitude parts", () => {
    const res = formatDuration(6 * day + 2 * minute, false);

    expect(res).not.toContain("h");
    expect(res).toBe("6d 2m");
  });

  test("seconds are ignored unless they are significant (< 1m)", () => {
    const insignificant = formatDuration(1 * hour + 2 * minute + 31 * second, false);

    expect(insignificant).not.toContain("s");
    expect(insignificant).toBe("1h 2m");

    const significant = formatDuration(31 * second, false);
    expect(significant).toBe("31s");
  });

  test("zero duration should output something", () => {
    expect(formatDuration(0, false)).toBe("0s");
    expect(formatDuration(0, true)).toBe("0s");
  });

  test("small duration should output something", () => {
    expect(formatDuration(1, false)).toBe("0s");
    expect(formatDuration(3, true)).toBe("0s");
  });
});
