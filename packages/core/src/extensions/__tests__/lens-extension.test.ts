/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LensExtension } from "../lens-extension";
import { Console } from "console";
import { stdout, stderr } from "process";

console = new Console(stdout, stderr);

let ext: LensExtension;

describe("lens extension", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1",
        engines: { lens: "^5.5.0" },
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

  describe("storeName", () => {
    it("returns storeName", () => {
      expect(ext.storeName).not.toBeDefined();
    });
  });

  describe("id", () => {
    it("returns id", () => {
      expect(ext.id).toBe("/this/is/fake/package.json");
    });
  });

  describe("storeLocation", () => {
    it("returns storeLocation", () => {
      expect(ext.storeLocation).toBe("foo-bar");      
    });
  });
});

describe("lens extension with storeName", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "@lensapp/foo-bar",
        storeName: "/test/foo-bar",
        version: "0.1.1",
        engines: { lens: "^5.5.0" },
      },
      id: "/this/is/fake/extension",
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });
  });

  describe("storeName", () => {
    it("returns storeName", () => {
      expect(ext.storeName).toBe("/test/foo-bar");
    });
  });

  describe("id", () => {
    it("derives id from storeName", () => {
      expect(ext.id).toBe("/test/foo-bar");
    });
  });

  describe("storeLocation", () => {
    it("derives storeLocation from storeName", () => {
      expect(ext.storeLocation).toBe("/test/foo-bar");      
    });
  });
});
