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

import { isCompatibleExtension } from "../extension-compatibility";
import { Console } from "console";
import { stdout, stderr } from "process";
import type { LensExtensionManifest } from "../lens-extension";
import { appSemVer } from "../../common/vars";

console = new Console(stdout, stderr);

describe("extension compatibility", () => {
  describe("appSemVer with no prerelease tag", () => {
    beforeAll(() => {
      appSemVer.major = 5;
      appSemVer.minor = 0;
      appSemVer.patch = 3;
      appSemVer.prerelease = [];
    });

    it("has no extension comparator", () => {
      const manifest = { name: "extensionName", version: "0.0.1" };

      expect(isCompatibleExtension(manifest)).toBe(false);
    });
    
    it.each([
      {
        comparator: "",
        expected: false,
      },
      {
        comparator: "bad comparator",
        expected: false,
      },
      {
        comparator: "^4.0.0",
        expected: false,
      },
      {
        comparator: "^5.0.0",
        expected: true,
      },
      {
        comparator: "^6.0.0",
        expected: false,
      },
      {
        comparator: "^4.0.0-alpha.1",
        expected: false,
      },
      {
        comparator: "^5.0.0-alpha.1",
        expected: true,
      },
      {
        comparator: "^6.0.0-alpha.1",
        expected: false,
      },
    ])("extension comparator test: %p", ({ comparator, expected }) => {
      const manifest: LensExtensionManifest = { name: "extensionName", version: "0.0.1", engines: { lens: comparator }};

      expect(isCompatibleExtension(manifest)).toBe(expected);
    });
  });

  describe("appSemVer with prerelease tag", () => {
    beforeAll(() => {
      appSemVer.major = 5;
      appSemVer.minor = 0;
      appSemVer.patch = 3;
      appSemVer.prerelease = ["beta", 3];
    });
    
    it("has no extension comparator", () => {
      const manifest = { name: "extensionName", version: "0.0.1" };

      expect(isCompatibleExtension(manifest)).toBe(false);
    });
    
    it.each([
      {
        comparator: "",
        expected: false,
      },
      {
        comparator: "bad comparator",
        expected: false,
      },
      {
        comparator: "^4.0.0",
        expected: false,
      },
      {
        comparator: "^5.0.0",
        expected: true,
      },
      {
        comparator: "^6.0.0",
        expected: false,
      },
      {
        comparator: "^4.0.0-alpha.1",
        expected: false,
      },
      {
        comparator: "^5.0.0-alpha.1",
        expected: true,
      },
      {
        comparator: "^6.0.0-alpha.1",
        expected: false,
      },
    ])("extension comparator test: %p", ({ comparator, expected }) => {
      const manifest: LensExtensionManifest = { name: "extensionName", version: "0.0.1", engines: { lens: comparator }};

      expect(isCompatibleExtension(manifest)).toBe(expected);
    });
  });
});
