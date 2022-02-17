/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionInstallChecker } from "../bundled-extension-install-checker";
import mockFs from "mock-fs";

const mockOpts = {
  "some-user-data-directory": {
    "some-file.tgz": "contents",
  },
  "extension-updates": {
    "file.txt": "text",
    "node-menu-0.0.1": {
      "package.json": "{\"name\": \"node-menu\", \"version\": \"0.0.1\"}",
    },
    "survey-0.0.1": {
      "dummyfile.text": "dummytext",
    },
  },
};

describe("BundledExtensionInstallChecker", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("Should return false if extension's package json not found", async () => {
    mockFs(mockOpts);

    const surveyInstalled = new BundledExtensionInstallChecker({
      name: "survey",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/node-menu-0.0.1.tgz",
    }, "./extension-updates").isUpdateAlredyInstalled();

    expect(surveyInstalled).toBeFalsy();
  });
});
