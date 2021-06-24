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

import { parseJsonPath } from "../jsonPath";

describe("parseJsonPath", () => {
  test("should convert \\. to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.kubesphere\\.io/alias-name");

    expect(res).toBe(".metadata.labels['kubesphere.io/alias-name']");
  });

  test("should convert keys with escaped characters to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.kubesphere\\\"io/alias-name");

    expect(res).toBe(".metadata.labels['kubesphere\"io/alias-name']");
  });

  test("should convert '-' to use indexed notation", () => {
    const res = parseJsonPath(".metadata.labels.alias-name");

    expect(res).toBe(".metadata.labels['alias-name']");
  });

  test("should handle scenario when both \\. and indexed notation are present", () => {
    const rest = parseJsonPath(".metadata.labels\\.serving['some.other.item']");

    expect(rest).toBe(".metadata['labels.serving']['some.other.item']");
  });


  test("should not touch given jsonPath if no invalid characters present", () => {
    const res = parseJsonPath(".status.conditions[?(@.type=='Ready')].status");

    expect(res).toBe(".status.conditions[?(@.type=='Ready')].status");
  });

  test("strips '\\' away from the result", () => {
    const res = parseJsonPath(".metadata.labels['serving\\.knative\\.dev/configuration']");

    expect(res).toBe(".metadata.labels['serving.knative.dev/configuration']");
  });

});
