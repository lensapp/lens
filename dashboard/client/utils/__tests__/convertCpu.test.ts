import { cpuUnitsToNumber } from "../convertCpu";

jest.mock('../../api/index', () => 'apiKube');
jest.mock('../../config.store', () => 'configStore');
describe("k8s CPU units conversion", () => {
  test("Convert normal, nano(n), micro(u), milli(m) units to cores number", () => {
    const units = [
      "0.5",
      "100m", // 0.1
      "930000n", // 0.00093
      "3028u", // 0.003028
    ]
    const cpuCores = units.map(unit => cpuUnitsToNumber(unit))
    const expected = [
      0.5,
      0.1,
      0.00093,
      0.003028
    ]
    expect(cpuCores).toEqual(expected)
  });
});