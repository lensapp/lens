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

import { nextUpdateChannel } from "../update-channel";

describe("nextUpdateChannel", () => {
  it("returns latest if current channel is latest", () => {
    expect(nextUpdateChannel("latest", "latest")).toEqual("latest");
  });

  it("returns beta if current channel is alpha", () => {
    expect(nextUpdateChannel("alpha", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("beta", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("rc", "alpha")).toEqual("beta");
    expect(nextUpdateChannel("latest", "alpha")).toEqual("beta");
  });

  it("returns rc if current channel is beta", () => {
    expect(nextUpdateChannel("alpha", "beta")).toEqual("rc");
    expect(nextUpdateChannel("beta", "beta")).toEqual("rc");
    expect(nextUpdateChannel("rc", "beta")).toEqual("rc");
    expect(nextUpdateChannel("latest", "beta")).toEqual("rc");
  });

  it("returns latest if current channel is rc", () => {
    expect(nextUpdateChannel("alpha", "rc")).toEqual("latest");
    expect(nextUpdateChannel("beta", "rc")).toEqual("latest");
    expect(nextUpdateChannel("rc", "rc")).toEqual("latest");
    expect(nextUpdateChannel("latest", "rc")).toEqual("latest");
  });
});
