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

import { LensExtension } from "../lens-extension";
import { Console } from "console";
import { stdout, stderr } from "process";
import { LensExtensionUpdateChecker } from "../lens-extension-update-checker";

console = new Console(stdout, stderr);

let ext: LensExtension = null;

describe("lens extension", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1",
      },
      id: "/this/is/fake/package.json",
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });
  });

  describe("name", () => {
    it("returns name", () => {
      expect(ext.name).toBe("foo-bar");
    });
  });

  describe("checkForUpdate", () => {
    it("runs update checker", async () => {
      const updateChecker = new LensExtensionUpdateChecker({});

      ext = new LensExtension({
        manifest: {
          name: "foo-bar",
          version: "0.1.1",
        },
        id: "/this/is/fake/package.json",
        absolutePath: "/absolute/fake/",
        manifestPath: "/this/is/fake/package.json",
        isBundled: false,
        isEnabled: true,
        isCompatible: true,
      }, updateChecker);

      const updateSpy = jest.spyOn(updateChecker, "run");

      await ext.checkForUpdate();

      expect(updateSpy).toHaveBeenCalledWith({
        name: "foo-bar",
        version: "0.1.1",
      });
    });
  });

  it("returns available update", async () => {
    const updateChecker = new LensExtensionUpdateChecker({});

    jest.spyOn(updateChecker, "run").mockResolvedValue({
      input: "foo",
      version: "1.0.0",
    });

    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1",
      },
      id: "/this/is/fake/package.json",
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    }, updateChecker);

    const availableUpdate = await ext.checkForUpdate();

    expect(availableUpdate).toEqual({
      input: "foo",
      version: "1.0.0",
    });
  });
});
