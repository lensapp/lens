/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computeDefaultShortName } from "../helpers";

describe("catalog helper tests", () => {
  describe("computeDefaultShortName", () => {
    it.each([
      ["a", "a"],
      ["", "??"],
      [1, "??"],
      [true, "??"],
      ["ab", "ab"],
      ["abc", "ab"],
      ["abcde", "ab"],
      ["ab-cd", "ac"],
      ["ab-cd la", "al"],
      ["ab-cd la_1", "al"],
      ["ab-cd la 1_3", "al1"],
      ["ab-cd la 1_3 lk", "al1"],
      ["ab-cd la 1_3 lk aj", "al1"],
      ["😀 a", "😀a"],
      ["😀😎 a", "😀a"],
      ["🇫🇮 Finland", "🇫🇮F"],
      ["إعجم", "إع"],
    ])("should compute from %p into %p", (input: any, output: string) => {
      expect(computeDefaultShortName(input)).toBe(output);
    });
  });
});
