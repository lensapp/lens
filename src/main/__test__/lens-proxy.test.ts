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

import { isLongRunningRequest } from "../lens-proxy";

describe("isLongRunningRequest", () => {
  it("returns true on watches", () => {
    ["watch=true", "watch=1", "watch"].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods?${param}`),
      ).toBeTruthy();
    });
  });

  it("returns false on disabled watches", () => {
    ["watch=false", "watch=0", ""].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods?${param}`),
      ).toBeFalsy();
    });
  });

  it("returns true on follows", () => {
    ["follow=true", "follow=1", "follow"].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods/foo/log?${param}`),
      ).toBeTruthy();
    });
  });

  it("returns false on disabled follows", () => {
    ["follow=false", "follow=0", ""].forEach((param) => {
      expect(
        isLongRunningRequest(`/api/v1/namespaces/default/pods/foo/log?${param}`),
      ).toBeFalsy();
    });
  });
});
