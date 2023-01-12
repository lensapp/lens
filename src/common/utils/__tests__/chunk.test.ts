/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { chunkSkipEnd } from "../chunk";

describe("chunkSkipEnd", () => {
  it("should yield no elements when given an empty iterator", () => {
    const i = chunkSkipEnd([], 2);

    expect(i.next()).toEqual({ done: true });
  });

  it("should yield no elements when given an iterator of size less than chunk=2", () => {
    const i = chunkSkipEnd([1], 2);

    expect(i.next()).toEqual({ done: true });
  });

  it("should yield no elements when given an chunk=0", () => {
    const i = chunkSkipEnd([1], 0);

    expect(i.next()).toEqual({ done: true });
  });

  it("should yield no elements when given an chunk<0", () => {
    const i = chunkSkipEnd([1], 0);

    expect(i.next()).toEqual({ done: true });
  });

  it("should yield no elements when given an iterator of size less than chunk=3", () => {
    const i = chunkSkipEnd([1, 2], 3);

    expect(i.next()).toEqual({ done: true });
  });

  it("should yield one chunk when given an iterator of size equal to chunk", () => {
    const i = chunkSkipEnd([1, 2], 2);

    expect(i.next()).toEqual({ done: false, value: [1, 2] });
    expect(i.next()).toEqual({ done: true });
  });

  it("should yield two chunks when given an iterator of size equal to chunk*2", () => {
    const i = chunkSkipEnd([1, 2, 3, 4], 2);

    expect(i.next()).toEqual({ done: false, value: [1, 2] });
    expect(i.next()).toEqual({ done: false, value: [3, 4] });
    expect(i.next()).toEqual({ done: true });
  });

  it("should yield two chunks when given an iterator of size between chunk*2 and chunk*3", () => {
    const i = chunkSkipEnd([1, 2, 3, 4, 5], 2);

    expect(i.next()).toEqual({ done: false, value: [1, 2] });
    expect(i.next()).toEqual({ done: false, value: [3, 4] });
    expect(i.next()).toEqual({ done: true });
  });
});
