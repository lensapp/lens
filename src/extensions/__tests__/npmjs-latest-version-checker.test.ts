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

import type { DownloadFileOptions } from "../../common/utils/downloadFile";
import { NpmJsVersionChecker } from "../npmjs-latest-version.checker";

const npmPackage = {
  versions: {
    "1.0.0": {
      name: "foo",
    },
  },
};

describe("NpmJsVersionChecker", () => {
  describe("getLatestVersion", () => {

    it("returns null if versions not present", async () => {
      const downloadJson = () => {
        return { promise: new Promise((resolve) => {
          resolve({});
        }) };
      };

      const checker = new NpmJsVersionChecker(downloadJson);


      const version = await checker.getLatestVersion({
        name: "foo",
        version: "0.1.0",
      });

      expect(version).toBeNull();
    });

    it("fetches latest release from npmjs", async () => {
      const downloadJson = (args: DownloadFileOptions) => {
        expect(args).toEqual({
          url: "https://registry.npmjs.com/foo",
        });

        return { promise: new Promise((resolve) => {
          resolve(npmPackage);
        }) };
      };

      const checker = new NpmJsVersionChecker(downloadJson);

      const version = await checker.getLatestVersion({
        name: "foo",
        version: "0.1.0",
      });

      expect(version).toEqual({
        input: "foo",
        version: "1.0.0",
      });
    });
  });
});
