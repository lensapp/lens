/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { bifurcateArray, splitArray } from "../splitArray";

describe("split array on element tests", () => {
  it("empty array", () => {
    expect(splitArray([], 10)).toStrictEqual([[], [], false]);
  });

  it("one element, not in array", () => {
    expect(splitArray([1], 10)).toStrictEqual([[1], [], false]);
  });

  it("ten elements, not in array", () => {
    expect(splitArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [], false]);
  });

  it("one elements, in array", () => {
    expect(splitArray([1], 1)).toStrictEqual([[], [], true]);
  });

  it("ten elements, in front array", () => {
    expect(splitArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0)).toStrictEqual([[], [1, 2, 3, 4, 5, 6, 7, 8, 9], true]);
  });

  it("ten elements, in middle array", () => {
    expect(splitArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toStrictEqual([[0, 1, 2, 3], [5, 6, 7, 8, 9], true]);
  });

  it("ten elements, in end array", () => {
    expect(splitArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 9)).toStrictEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8], [], true]);
  });
});

describe("bifurcateArray", () => {
  it("should return tuple of empty arrays from empty array", () => {
    const [left, right] = bifurcateArray([], () => true);

    expect(left).toStrictEqual([]);
    expect(right).toStrictEqual([]);
  });

  it("should return all true condition returning items in the right array", () => {
    const [left, right] = bifurcateArray([1, 2, 3], () => true);

    expect(left).toStrictEqual([]);
    expect(right).toStrictEqual([1, 2, 3]);
  });

  it("should return all false condition returning items in the right array", () => {
    const [left, right] = bifurcateArray([1, 2, 3], () => false);

    expect(left).toStrictEqual([1, 2, 3]);
    expect(right).toStrictEqual([]);
  });

  it("should split array as specified", () => {
    const [left, right] = bifurcateArray([1, 2, 3], (i) => Boolean(i % 2));

    expect(left).toStrictEqual([2]);
    expect(right).toStrictEqual([1, 3]);
  });
});
