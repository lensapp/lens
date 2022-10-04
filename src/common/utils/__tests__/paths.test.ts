/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
