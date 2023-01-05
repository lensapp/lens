/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { findExactlyOne } from "./find-exactly-one";

describe("find-exactly-one", () => {
  it("when predicate matches to single item, returns the item", () => {
    const actual = findExactlyOne((item) => item === "some-item")([
      "some-item",
      "some-other-item",
    ]);

    expect(actual).toBe("some-item");
  });

  it("when predicate matches to many items, throws", () => {
    expect(() => {
      findExactlyOne((item) => item === "some-item")([
        "some-item",
        "some-item",
      ]);
    }).toThrow("Tried to find exactly one, but found many");
  });

  it("when predicate does not match, throws", () => {
    expect(() => {
      findExactlyOne((item) => item === "some-item")([
        "some-other-item",
      ]);
    }).toThrow("Tried to find exactly one, but didn't find any");
  });
});
