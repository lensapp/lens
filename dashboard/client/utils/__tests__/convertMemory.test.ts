import { bytesToUnits, unitsToBytes } from "../convertMemory";

jest.mock('../../api/index', () => 'apiKube');
jest.mock('../../config.store', () => 'configStore');
describe("Kubernetes units conversion", () => {
  test("Convert bytes to units", () => {
    const bytes = [
      128,
      2048, // 2Ki
      2097152, // 2Mi
      4596968000, // 4.2Gi
      4596968000000, // 4.1Ti
      1.2384898975269E+15 // 1.1Pi
    ]
    const units = bytes.map(byte => bytesToUnits(byte))
    const expected = [
      "128B",
      "2.0Ki",
      "2.0Mi",
      "4.3Gi",
      "4.2Ti",
      "1.1Pi"
    ]
    expect(units).toEqual(expected)
  });

  test("Convert bytes to units with decimal precision", () => {
    const bytes = [
      2107152, // 2.010Mi
      4596968000, // 4.281Gi
    ]
    const units = bytes.map(byte => bytesToUnits(byte, 3))
    const expected = [
      "2.010Mi",
      "4.281Gi"
    ]
    expect(units).toEqual(expected)
  })

  test("Convert 0 to bytes", () => {
    expect(bytesToUnits(0)).toEqual("N/A");
  });

  test("Convert full units to bytes", () => {
    const units = [
      "128",
      "22Ki", // 22528
      "17.2Mi", // 18035507
      "7.99Gi", // 8579197173
      "2Ti", // 2199023255552
      "1Pi", // 1125899906842624
    ]
    const expected = [
      128,
      22528,
      18035507,
      8579197173,
      2199023255552,
      1125899906842624
    ]
    const bytes = units.map(unitsToBytes)
    expect(bytes).toEqual(expected)
  });

  test("Convert shorten units to bytes", () => {
    const units = [
      "128",
      "22K", // 22528
      "17.2M", // 18035507
      "7.99G", // 8579197173
      "2T", // 2199023255552
      "1P", // 1125899906842624
    ]
    const expected = [
      128,
      22528,
      18035507,
      8579197173,
      2199023255552,
      1125899906842624
    ]
    const bytes = units.map(unitsToBytes)
    expect(bytes).toEqual(expected)
  });

  test("Convert strange unit to bytes", () => {
    expect(unitsToBytes("sss")).toEqual(NaN);
  });
});