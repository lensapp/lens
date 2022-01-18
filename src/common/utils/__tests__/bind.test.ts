/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { bind } from "../index";

describe("bind", () => {
  it("should work correctly", () => {
    function foobar(bound: number, nonBound: number): number {
      expect(typeof bound).toBe("number");
      expect(typeof nonBound).toBe("number");

      return bound + nonBound;
    }
    const foobarBound = bind(foobar, null, 5);

    expect(foobarBound(10)).toBe(15);
  });
});
