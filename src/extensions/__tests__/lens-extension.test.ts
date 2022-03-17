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
});
