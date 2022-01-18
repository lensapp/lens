/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
