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

import { nFircate } from "../n-fircate";

describe("nFircate", () => {
  it("should produce an empty array if no parts are provided", () => {
    expect(nFircate([{ a: 1 }, { a: 2 }], "a", []).length).toBe(0);
  });

  it("should ignore non-matching parts", () => {
    const res = nFircate([{ a: 1 }, { a: 2 }], "a", [1]);
    
    expect(res.length).toBe(1);
    expect(res[0].length).toBe(1);
  });

  it("should include all matching parts in each type", () => {
    const res = nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2]);
    
    expect(res.length).toBe(2);
    expect(res[0].length).toBe(2);
    expect(res[0][0].b).toBe("a");
    expect(res[0][1].b).toBe("c");
    expect(res[1].length).toBe(1);
    expect(res[1][0].b).toBe("b");
  });

  it("should throw a type error if the same part is provided more than once", () => {
    try {
      nFircate([{ a: 1, b: "a" }, { a: 2, b: "b" }, { a: 1, b: "c" }], "a", [1, 2, 1]);
      fail("Expected error");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }
  });
});
