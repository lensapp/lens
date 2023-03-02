/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getConvertedParts } from "./name-parts";

describe("getConvertedParts", () => {
  it.each([
    ["hello", ["hello"]],
    ["hello.goodbye", ["hello", "goodbye"]],
    ["hello.1", ["hello", 1]],
    ["3-hello.1", [3, "hello", 1]],
    ["3_hello.1", [3, "hello", 1]],
    ["3_hello.1/foobar", [3, "hello", 1, "foobar"]],
    ["3_hello.1/foobar\\new", [3, "hello", 1, "foobar", "new"]],
  ])("Splits '%s' as into %j", (input, output) => {
    expect(getConvertedParts(input)).toEqual(output);
  });
});
