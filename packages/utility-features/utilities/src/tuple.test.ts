/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { tuple } from "./tuple";

describe("tuple tests", () => {
  describe("zip()", () => {
    it("should yield 0 times and return 1 tuple of empty arrays when given empty array", () => {
      expect(tuple.zip([]).next()).toEqual({
        done: true,
        value: [[]],
      });
    });

    it("should yield 1 times and return 2 tuple of empty arrays when given one element array tuples", () => {
      const i = tuple.zip([1], [2]);

      expect(i.next()).toEqual({
        done: false,
        value: [1, 2],
      });
      expect(i.next()).toEqual({
        done: true,
        value: [[], []],
      });
    });

    it("should yield 1 times and return 2 tuple of partial arrays when given one element array tuples", () => {
      const i = tuple.zip([1], [2, 3]);

      expect(i.next()).toEqual({
        done: false,
        value: [1, 2],
      });
      expect(i.next()).toEqual({
        done: true,
        value: [[], [3]],
      });
    });
  });
});
