/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import path from "path";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import getAbsolutePathInjectable from "../../path/get-absolute-path.injectable";
import getDirnameOfPathInjectable from "../../path/get-dirname.injectable";
import type { IsLogicalChildPath } from "../../path/is-logical-child-path.injectable";
import isLogicalChildPathInjectable from "../../path/is-logical-child-path.injectable";

describe("isLogicalChildPath", () => {
  let di: DiContainer;
  let isLogicalChildPath: IsLogicalChildPath;

  beforeEach(() => {
    di = getDiForUnitTesting();
  });

  describe("when using win32 paths", () => {
    beforeEach(() => {
      di.override(getAbsolutePathInjectable, () => path.win32.resolve);
      di.override(getDirnameOfPathInjectable, () => path.win32.dirname);
      isLogicalChildPath = di.inject(isLogicalChildPathInjectable);
    });

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

  describe("when using posix paths", () => {
    beforeEach(() => {
      di.override(getAbsolutePathInjectable, () => path.posix.resolve);
      di.override(getDirnameOfPathInjectable, () => path.posix.dirname);
      isLogicalChildPath = di.inject(isLogicalChildPathInjectable);
    });

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
