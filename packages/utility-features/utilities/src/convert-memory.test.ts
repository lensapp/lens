/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { bytesToUnits, unitsToBytes } from "./convertMemory";

describe("unitsToBytes", () => {
  it("without any units, just parse as float", () => {
    expect(unitsToBytes("1234")).toBe(1234);
  });

  it("should parse with B suffix", () => {
    expect(unitsToBytes("1234B")).toBe(1234);
  });

  it("should parse with Ki suffix", () => {
    expect(unitsToBytes("1234Ki")).toBe(1234 * (1024));
  });

  it("should parse with Ki suffix as the same as KiB", () => {
    expect(unitsToBytes("1234Ki")).toBe(unitsToBytes("1234KiB"));
  });

  it("should parse with Mi suffix", () => {
    expect(unitsToBytes("1234Mi")).toBe(1234 * (1024 ** 2));
  });

  it("should parse with Mi suffix as the same as MiB", () => {
    expect(unitsToBytes("1234Mi")).toBe(unitsToBytes("1234MiB"));
  });

  it("should parse with Gi suffix", () => {
    expect(unitsToBytes("1234Gi")).toBe(1234 * (1024 ** 3));
  });

  it("should parse with Gi suffix as the same as GiB", () => {
    expect(unitsToBytes("1234Gi")).toBe(unitsToBytes("1234GiB"));
  });

  it("should parse with Ti suffix", () => {
    expect(unitsToBytes("1234Ti")).toBe(1234 * (1024 ** 4));
  });

  it("should parse with Ti suffix as the same as TiB", () => {
    expect(unitsToBytes("1234Ti")).toBe(unitsToBytes("1234TiB"));
  });

  it("should parse with Pi suffix", () => {
    expect(unitsToBytes("1234Pi")).toBe(1234 * (1024 ** 5));
  });

  it("should parse with Pi suffix as the same as PiB", () => {
    expect(unitsToBytes("1234Pi")).toBe(unitsToBytes("1234PiB"));
  });

  it("given unrelated data, return NaN", () => {
    expect(unitsToBytes("I am not a number")).toBeNaN();
  });

  it("given unrelated data, but has number, return that", () => {
    expect(unitsToBytes("I am not a number, but this is 0.1")).toBe(0.1);
  });
});

describe("bytesToUnits", () => {
  it("should return N/A for invalid bytes", () => {
    expect(bytesToUnits(-1)).toBe("N/A");
    expect(bytesToUnits(Infinity)).toBe("N/A");
    expect(bytesToUnits(NaN)).toBe("N/A");
  });

  it("given a number within the magnitude of 0..124, format with B", () => {
    expect(bytesToUnits(100)).toBe("100.0B");
  });

  it("given a number within the magnitude of 1024..1024^2, format with KiB", () => {
    expect(bytesToUnits(1024)).toBe("1.0KiB");
    expect(bytesToUnits(2048)).toBe("2.0KiB");
    expect(bytesToUnits(1900)).toBe("1.9KiB");
    expect(bytesToUnits(50*1024 + 1)).toBe("50.0KiB");
  });

  it("given a number within the magnitude of 1024^2..1024^3, format with MiB", () => {
    expect(bytesToUnits(1024**2)).toBe("1.0MiB");
    expect(bytesToUnits(2048**2)).toBe("4.0MiB");
    expect(bytesToUnits(1900 * 1024)).toBe("1.9MiB");
    expect(bytesToUnits(50*(1024 ** 2) + 1)).toBe("50.0MiB");
  });

  it("given a number within the magnitude of 1024^3..1024^4, format with GiB", () => {
    expect(bytesToUnits(1024**3)).toBe("1.0GiB");
    expect(bytesToUnits(2048**3)).toBe("8.0GiB");
    expect(bytesToUnits(1900 * 1024 ** 2)).toBe("1.9GiB");
    expect(bytesToUnits(50*(1024 ** 3) + 1)).toBe("50.0GiB");
  });

  it("given a number within the magnitude of 1024^4..1024^5, format with TiB", () => {
    expect(bytesToUnits(1024**4)).toBe("1.0TiB");
    expect(bytesToUnits(2048**4)).toBe("16.0TiB");
    expect(bytesToUnits(1900 * 1024 ** 3)).toBe("1.9TiB");
    expect(bytesToUnits(50*(1024 ** 4) + 1)).toBe("50.0TiB");
  });

  it("given a number within the magnitude of 1024^5..1024^6, format with PiB", () => {
    expect(bytesToUnits(1024**5)).toBe("1.0PiB");
    expect(bytesToUnits(2048**5)).toBe("32.0PiB");
    expect(bytesToUnits(1900 * 1024 ** 4)).toBe("1.9PiB");
    expect(bytesToUnits(50*(1024 ** 5) + 1)).toBe("50.0PiB");
  });
});

describe("bytesToUnits -> unitsToBytes", () => {
  it("given an input, round trip to the same value, given enough precision", () => {
    expect(unitsToBytes(bytesToUnits(123))).toBe(123);
    expect(unitsToBytes(bytesToUnits(1024**0 + 1, { precision: 2 }))).toBe(1024**0 + 1);
    expect(unitsToBytes(bytesToUnits(1024**1 + 2, { precision: 3 }))).toBe(1024**1 + 2);
    expect(unitsToBytes(bytesToUnits(1024**2 + 3, { precision: 6 }))).toBe(1024**2 + 3);
    expect(unitsToBytes(bytesToUnits(1024**3 + 4, { precision: 9 }))).toBe(1024**3 + 4);
    expect(unitsToBytes(bytesToUnits(1024**4 + 5, { precision: 12 }))).toBe(1024**4 + 5);
    expect(unitsToBytes(bytesToUnits(1024**5 + 6, { precision: 16 }))).toBe(1024**5 + 6);
    expect(unitsToBytes(bytesToUnits(1024**6 + 7, { precision: 20 }))).toBe(1024**6 + 7);
  });

  it("given an invalid input, round trips to NaN", () => {
    expect(unitsToBytes(bytesToUnits(-1))).toBeNaN();
  });
});
