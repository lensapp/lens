/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { addSeparator } from "./add-separator";

describe("add-separator", () => {
  it("given multiple items, adds separators", () => {
    const items = ["first", "second", "third"];

    const actual = addSeparator((left, right) => `separator-between-${left}-and-${right}`, items);

    expect(actual).toEqual([
      "first",
      "separator-between-first-and-second",
      "second",
      "separator-between-second-and-third",
      "third",
    ]);
  });

  it("given multiple items including falsy ones, adds separators", () => {
    const items = [false, undefined, null, NaN];

    const actual = addSeparator((left, right) => `separator-between-${left}-and-${right}`, items);

    expect(actual).toEqual([
      false,
      "separator-between-false-and-undefined",
      undefined,
      "separator-between-undefined-and-null",
      null,
      "separator-between-null-and-NaN",
      NaN,
    ]);
  });

  it("given no items, does not add separator", () => {
    const items: any[] = [];

    const actual = addSeparator(() => "separator", items);

    expect(actual).toEqual([]);
  });

  it("given one item, does not add separator", () => {
    const items = ["first"];

    const actual = addSeparator(() => "separator", items);

    expect(actual).toEqual(["first"]);
  });
});
