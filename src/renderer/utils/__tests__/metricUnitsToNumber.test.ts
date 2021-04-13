import { metricUnitsToNumber } from "../metricUnitsToNumber";

describe("metricUnitsToNumber tests", () => {
  test("plain number", () => {
    expect(metricUnitsToNumber("124")).toStrictEqual(124);
  });

  test("with k suffix", () => {
    expect(metricUnitsToNumber("124k")).toStrictEqual(124000);
  });

  test("with m suffix", () => {
    expect(metricUnitsToNumber("124m")).toStrictEqual(124000000);
  });
});
