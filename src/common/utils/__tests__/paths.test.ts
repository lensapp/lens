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

import { describeIf } from "../../../../integration/helpers/utils";
import { isWindows } from "../../vars";
import { isLogicalChildPath } from "../paths";

describe("isLogicalChildPath", () => {
  describeIf(isWindows)("windows tests", () => {
    it.each([
      {
        parentPath: "C:\\Foo",
        testPath: "C:\\Foo\\Bar",
        expected: true,
      },
      {
        parentPath: "C:\\Foo",
        testPath: "C:\\Bar",
        expected: false,
      },
      {
        parentPath: "C:\\Foo",
        testPath: "C:/Bar",
        expected: false,
      },
      {
        parentPath: "C:\\Foo",
        testPath: "C:/Foo/Bar",
        expected: true,
      },
      {
        parentPath: "C:\\Foo",
        testPath: "D:\\Foo\\Bar",
        expected: false,
      },
    ])("test %#", (testData) => {
      expect(isLogicalChildPath(testData.parentPath, testData.testPath)).toBe(testData.expected);
    });
  });

  describeIf(!isWindows)("posix tests", () => {
    it.each([
      {
        parentPath: "/foo",
        testPath: "/foo",
        expected: false,
      },
      {
        parentPath: "/foo",
        testPath: "/bar",
        expected: false,
      },
      {
        parentPath: "/foo",
        testPath: "/foobar",
        expected: false,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/../bar",
        expected: false,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/./bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/.bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/..bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/...bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/..\\.bar",
        expected: true,
      },
      {
        parentPath: "/bar/../foo",
        testPath: "/foo/bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "/foo/\\bar",
        expected: true,
      },
      {
        parentPath: "/foo",
        testPath: "./bar",
        expected: false,
      },
    ])("test %#", (testData) => {
      expect(isLogicalChildPath(testData.parentPath, testData.testPath)).toBe(testData.expected);
    });
  });
});
