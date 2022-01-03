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

import type { LensExtensionLatestVersionChecker } from "../lens-extension-latest-version-checker";
import { LensExtensionAvailableUpdate, LensExtensionUpdateChecker } from "../lens-extension-update-checker";

class TestLatestVersionChecker implements LensExtensionLatestVersionChecker {
  async getLatestVersion(): Promise<LensExtensionAvailableUpdate> {
    return {
      input: "foo",
      version: "1.0.0",
    };
  }
}

class TestLatestVersionChecker2 implements LensExtensionLatestVersionChecker {
  async getLatestVersion(): Promise<LensExtensionAvailableUpdate> {
    return {
      input: "bar",
      version: "0.5.0",
    };
  }
}

let updateChecker: LensExtensionUpdateChecker;
const versionChecker1 = new TestLatestVersionChecker();
const versionChecker2 = new TestLatestVersionChecker2();

describe("LensExtensionUpdateChecker", () => {
  beforeEach(() => {
    updateChecker = new LensExtensionUpdateChecker({
      foo: versionChecker1,
      bar: versionChecker2,
    });
  });

  describe("run", () => {
    it("checks latest version from version checker", async () => {
      const versionCheckerSpy = jest.spyOn(versionChecker1, "getLatestVersion");
      const versionCheckerSpy2 = jest.spyOn(versionChecker2, "getLatestVersion");

      await updateChecker.run({
        name: "foo-bar",
        version: "0.1.1",
      });

      expect(versionCheckerSpy).toHaveBeenCalled();
      expect(versionCheckerSpy2).toHaveBeenCalled();
    });

    it("returns latest version from version checkers", async () => {
      const update = await updateChecker.run({
        name: "foo-bar",
        version: "0.1.1",
      });

      expect(update.version).toEqual("1.0.0");
      expect(update.input).toEqual("foo");
    });

  });
});
