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
import { isObservable, observable } from "mobx";
import { toJS } from "../toJS";

describe("utils/toJS(data: any)", () => {
  const y = { y: 2 };

  const data = observable({ x: 1, y }, {}, {
    deep: false, // this will keep ref to "y"
  });
  const data2 = {
    x: 1,  // partially observable
    y: observable(y),
  };

  test("converts mobx-observable to corresponding js struct with links preserving", () => {
    expect(toJS(data).y).toBe(y);
    expect(isObservable(toJS(data).y)).toBeFalsy();
  });

  test("converts partially observable js struct", () => {
    expect(toJS(data2).y).not.toBe(y);
    expect(toJS(data2).y).toEqual(y);
    expect(isObservable(toJS(data2).y)).toBeFalsy();
  });
});
