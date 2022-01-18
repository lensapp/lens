/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
