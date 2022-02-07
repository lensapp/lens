/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionUpdater } from "../bundled-extension-updater";
import fs from "fs";
import mockFs from "mock-fs";
import nock from "nock";

const mockOpts = {
  "some-user-data-directory": {
    "some-file.tgz": "file content here",
  },
  "extension-updates": {
    "file.txt": "text",
  },
};

describe("BundledExtensionUpdater", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("Should download file from server", async () => {
    mockFs(mockOpts);

    const scope = nock("http://my-example-url.com")
      .get("/node-menu-0.0.1.tgz")
      .replyWithFile(200, `./some-user-data-directory/some-file.tgz`, {
        "Content-Type": "application/tar",
      });

    await new BundledExtensionUpdater({
      name: "node-menu",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/node-menu-0.0.1.tgz",
    }, "./extension-updates").update();

    const exist = await fs.promises.access(mockFs.bypass(() => "./extension-updates/node-menu-0.0.1.tgz"), fs.constants.F_OK);

    expect(exist).toBeTruthy();
  });
});
