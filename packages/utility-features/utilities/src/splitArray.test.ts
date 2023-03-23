/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { array } from "./array";

describe("split array on element tests", () => {
  it("empty array", () => {
    expect(array.split([], 10)).toStrictEqual([[], [], false]);
  });

  it("one element, not in array", () => {
    expect(array.split([1], 10)).toStrictEqual([[1], [], false]);
  });

  it("ten elements, not in array", () => {
    expect(array.split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [], false]);
  });

  it("one elements, in array", () => {
    expect(array.split([1], 1)).toStrictEqual([[], [], true]);
  });

  it("ten elements, in front array", () => {
    expect(array.split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0)).toStrictEqual([[], [1, 2, 3, 4, 5, 6, 7, 8, 9], true]);
  });

  it("ten elements, in middle array", () => {
    expect(array.split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toStrictEqual([[0, 1, 2, 3], [5, 6, 7, 8, 9], true]);
  });

  it("ten elements, in end array", () => {
    expect(array.split([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 9)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8], [], true]);
  });
});

describe("bifurcateArray", () => {
  it("should return tuple of empty arrays from empty array", () => {
    const [left, right] = array.bifurcate([], () => true);

    expect(left).toStrictEqual([]);
    expect(right).toStrictEqual([]);
  });

  it("should return all true condition returning items in the right array", () => {
    const [left, right] = array.bifurcate([1, 2, 3], () => true);

    expect(left).toStrictEqual([]);
    expect(right).toStrictEqual([1, 2, 3]);
  });

  it("should return all false condition returning items in the right array", () => {
    const [left, right] = array.bifurcate([1, 2, 3], () => false);

    expect(left).toStrictEqual([1, 2, 3]);
    expect(right).toStrictEqual([]);
  });

  it("should split array as specified", () => {
    const [left, right] = array.bifurcate([1, 2, 3], (i) => Boolean(i % 2));

    expect(left).toStrictEqual([2]);
    expect(right).toStrictEqual([1, 3]);
  });
});
