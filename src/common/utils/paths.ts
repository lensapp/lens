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

import path from "path";
import os from "os";

function resolveTilde(filePath: string) {
  if (filePath[0] === "~" && (filePath[1] === "/" || filePath.length === 1)) {
    return filePath.replace("~", os.homedir());
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
