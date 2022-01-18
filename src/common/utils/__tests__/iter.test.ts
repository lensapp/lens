/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { reduce } from "../iter";

describe("iter", () => {
  describe("reduce", () => {
    it("can reduce a value", () => {
      expect(reduce([1, 2, 3], (acc: number[], current: number) => [current, ...acc], [0])).toEqual([3, 2, 1, 0]);
    });

    it("can reduce an empty iterable", () => {
      expect(reduce([], (acc: number[], current: number) => [acc[0] + current], [])).toEqual([]);
    });
  });
});
