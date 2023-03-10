/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { iter } from "./iter";

describe("iter", () => {
  describe("reduce", () => {
    it("can reduce a value", () => {
      expect(iter.reduce([1, 2, 3], (acc: number[], current: number) => [current, ...acc], [0])).toEqual([3, 2, 1, 0]);
    });

    it("can reduce an empty iterable", () => {
      expect(iter.reduce([], (acc: number[], current: number) => [acc[0] + current], [])).toEqual([]);
    });
  });

  describe("join", () => {
    it("should not prefix the output by the separator", () => {
      expect(iter.join(["a", "b", "c"].values(), " ")).toBe("a b c");
    });

    it("should return empty string if iterator is empty", () => {
      expect(iter.join([].values(), " ")).toBe("");
    });

    it("should return just first entry if iterator is of size 1", () => {
      expect(iter.join(["d"].values(), " ")).toBe("d");
    });
  });

  describe("nth", () => {
    it("should return undefined past the end of the iterator", () => {
      expect(iter.nth(["a"], 123)).toBeUndefined();
    });

    it("should by 0-indexing the index", () => {
      expect(iter.nth(["a", "b"], 0)).toBe("a");
    });
  });

  describe("concat", () => {
    it("should yield undefined for empty args", () => {
      const i = iter.concat();

      expect(i.next()).toEqual({ done: true });
    });

    it("should yield undefined for only empty args", () => {
      const i = iter.concat([].values(), [].values(), [].values(), [].values());

      expect(i.next()).toEqual({ done: true });
    });

    it("should yield all of the first and then all of the second", () => {
      const i = iter.concat([1, 2, 3].values(), [4, 5, 6].values());

      expect(i.next()).toEqual({ done: false, value: 1 });
      expect(i.next()).toEqual({ done: false, value: 2 });
      expect(i.next()).toEqual({ done: false, value: 3 });
      expect(i.next()).toEqual({ done: false, value: 4 });
      expect(i.next()).toEqual({ done: false, value: 5 });
      expect(i.next()).toEqual({ done: false, value: 6 });
      expect(i.next()).toEqual({ done: true });
    });
  });

  describe("nFircate", () => {
    it("should produce an empty array if no parts are provided", () => {
      expect(iter.nFircate([{ a: 1 }, { a: 2 }], "a", []).length).toBe(0);
    });

    it("should ignore non-matching parts", () => {
      const res = iter.nFircate([{ a: 1 }, { a: 2 }], "a", [1]);

      expect(res.length).toBe(1);
      expect(res[0].length).toBe(1);
    });

    it("should include all matching parts in each type", () => {
      const res = iter.nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2]);

      expect(res.length).toBe(2);
      expect(res[0].length).toBe(2);
      expect(res[0][0].b).toBe("a");
      expect(res[0][1].b).toBe("c");
      expect(res[1].length).toBe(1);
      expect(res[1][0].b).toBe("b");
    });

    it("should throw a type error if the same part is provided more than once", () => {
      try {
        iter.nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2, 1]);
        fail("Expected error");
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    });
  });
});
