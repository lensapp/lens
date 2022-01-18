/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { nFircate } from "../n-fircate";

describe("nFircate", () => {
  it("should produce an empty array if no parts are provided", () => {
    expect(nFircate([{ a: 1 }, { a: 2 }], "a", []).length).toBe(0);
  });

  it("should ignore non-matching parts", () => {
    const res = nFircate([{ a: 1 }, { a: 2 }], "a", [1]);

    expect(res.length).toBe(1);
    expect(res[0].length).toBe(1);
  });

  it("should include all matching parts in each type", () => {
    const res = nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2]);

    expect(res.length).toBe(2);
    expect(res[0].length).toBe(2);
    expect(res[0][0].b).toBe("a");
    expect(res[0][1].b).toBe("c");
    expect(res[1].length).toBe(1);
    expect(res[1][0].b).toBe("b");
  });

  it("should throw a type error if the same part is provided more than once", () => {
    try {
      nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2, 1]);
      fail("Expected error");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }
  });
});
