/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { rawIsCompatibleExtension } from "../extension-compatibility";
import { Console } from "console";
import { stdout, stderr } from "process";
import type { LensExtensionManifest } from "../lens-extension";
import { SemVer } from "semver";

console = new Console(stdout, stderr);

describe("extension compatibility", () => {
  describe("appSemVer with no prerelease tag", () => {
    const isCompatibleExtension = rawIsCompatibleExtension(new SemVer("5.0.3"));

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
    const isCompatibleExtension = rawIsCompatibleExtension(new SemVer("5.0.3-beta.3"));

    it("^5.1.0 should work when lens' version is 5.1.0-latest.123456789", () => {
      const comparer = rawIsCompatibleExtension(new SemVer("5.1.0-latest.123456789"));

      expect(comparer({ name: "extensionName", version: "0.0.1", engines: { lens: "^5.1.0" }})).toBe(true);
    });

    it("^5.1.0 should not when lens' version is 5.1.0-beta.1.123456789", () => {
      const comparer = rawIsCompatibleExtension(new SemVer("5.1.0-beta.123456789"));

      expect(comparer({ name: "extensionName", version: "0.0.1", engines: { lens: "^5.1.0" }})).toBe(false);
    });

    it("^5.1.0 should not when lens' version is 5.1.0-alpha.1.123456789", () => {
      const comparer = rawIsCompatibleExtension(new SemVer("5.1.0-alpha.123456789"));

      expect(comparer({ name: "extensionName", version: "0.0.1", engines: { lens: "^5.1.0" }})).toBe(false);
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
      expect(isCompatibleExtension({ name: "extensionName", version: "0.0.1", engines: { lens: comparator }})).toBe(expected);
    });
  });
});
