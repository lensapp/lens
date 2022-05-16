/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { join, nth, reduce } from "../iter";

describe("iter", () => {
  describe("reduce", () => {
    it("can reduce a value", () => {
      expect(reduce([1, 2, 3], (acc: number[], current: number) => [current, ...acc], [0])).toEqual([3, 2, 1, 0]);
    });

    it("can reduce an empty iterable", () => {
      expect(reduce([], (acc: number[], current: number) => [acc[0] + current], [])).toEqual([]);
    });
  });

  describe("join", () => {
    it("should not prefix the output by the seperator", () => {
      expect(join(["a", "b", "c"].values(), " ")).toBe("a b c");
    });

    it("should return empty string if iterator is empty", () => {
      expect(join([].values(), " ")).toBe("");
    });

    it("should return just first entry if iterator is of size 1", () => {
      expect(join(["d"].values(), " ")).toBe("d");
    });
  });

  describe("nth", () => {
    it("should return undefined past the end of the iterator", () => {
      expect(nth(["a"], 123)).toBeUndefined();
    });

    it("should by 0-indexing the index", () => {
      expect(nth(["a", "b"], 0)).toBe("a");
    });
  });
});
