/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import os from "os";

export function resolveTilde(filePath: string) {
  if (filePath === "~") {
    return os.homedir();
  }

  if (filePath.startsWith("~/")) {
    return `${os.homedir()}${filePath.slice(1)}`;
  }

  return filePath;
}

export function resolvePath(filePath: string): string {
  return path.resolve(resolveTilde(filePath));
}

/**
 * Checks if `testPath` represents a potential filesystem entry that would be
 * logically "within" the `parentPath` directory.
 *
 * This function will return `true` in the above case, and `false` otherwise.
 * It will return `false` if the two paths are the same (after resolving them).
 *
 * The function makes no FS calls and is platform dependant. Meaning that the
 * results are only guaranteed to be correct for the platform you are running
 * on.
 * @param parentPath The known path of a directory
 * @param testPath The path that is to be tested
 */
export function isLogicalChildPath(parentPath: string, testPath: string): boolean {
  parentPath = path.resolve(parentPath);
  testPath = path.resolve(testPath);

  if (parentPath === testPath) {
    return false;
  }

  while (testPath.length >= parentPath.length) {
    if (testPath === parentPath) {
      return true;
    }

    testPath = path.dirname(testPath);
  }

  return false;
}
