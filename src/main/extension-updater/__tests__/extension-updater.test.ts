/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionUpdater } from "../bundled-extension-updater";
import fs from "fs";
import mockFs from "mock-fs";
import nock from "nock";
import path from "path";

const mockOpts = {
  "some-user-data-directory": {
    "some-file.tgz": mockFs.load(path.resolve(__dirname, "./survey-mock.tgz")),
  },
  "extension-updates": {
    "file.txt": "text",
    "node-menu-0.0.1": {
      "package.json": "manifest",
    },
  },
};

describe("BundledExtensionUpdater", () => {
  afterEach(() => {
    mockFs.restore();
    nock.cleanAll();
  });

  it("Should download file from server", async () => {
    mockFs(mockOpts);

    nock("http://my-example-url.com")
      .get("/node-menu-0.0.1.tgz")
      .replyWithFile(200, `./some-user-data-directory/some-file.tgz`, {
        "Content-Type": "application/tar",
      });

    await new BundledExtensionUpdater({
      name: "node-menu",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/node-menu-0.0.1.tgz",
    }, "./extension-updates").update();


    const exist = fs.existsSync("./extension-updates/node-menu-0.0.1.tgz");

    expect(exist).toBeTruthy();
  });

  it("Should skip download if no file found on server", () => {
    mockFs(mockOpts);

    nock("http://my-example-url.com")
      .get("/node-menu-0.0.1.tgz")
      .reply(404, { notfound: "not found" });

    const exist = fs.existsSync("./extension-updates/node-menu-0.0.1.tgz");

    expect(exist).toBeFalsy();
  });

  it("Should remove previous package folder", async () => {
    mockFs(mockOpts);

    nock("http://my-example-url.com")
      .get("/node-menu-0.0.1.tgz")
      .replyWithFile(200, `./some-user-data-directory/some-file.tgz`, {
        "Content-Type": "application/tar",
      });

    await new BundledExtensionUpdater({
      name: "node-menu",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/node-menu-0.0.1.tgz",
    }, "./extension-updates").update();

    const exist = fs.existsSync("./extension-updates/node-menu-0.0.1");

    expect(exist).toBeFalsy();
  });

  it("Should not remove any other folders", async () => {
    mockFs(mockOpts);

    nock("http://my-example-url.com")
      .get("/survey-0.0.1.tgz")
      .replyWithFile(200, `./some-user-data-directory/some-file.tgz`, {
        "Content-Type": "application/tar",
      });

    await new BundledExtensionUpdater({
      name: "survey",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/survey-0.0.1.tgz",
    }, "./extension-updates").update();

    const exist = fs.existsSync("./extension-updates/node-menu-0.0.1");

    expect(exist).toBeTruthy();
  });

  it.only("Should unpack downloaded tar file", async () => {
    mockFs(mockOpts);

    nock("http://my-example-url.com")
      .get("/some-file.tgz")
      .replyWithFile(200, `./some-user-data-directory/some-file.tgz`, {
        "Content-Type": "application/tar",
      });

    await new BundledExtensionUpdater({
      name: "test-extension",
      version: "0.0.1",
      downloadUrl: "http://my-example-url.com/some-file.tgz",
    }, "./extension-updates").update();

    fs.readdirSync("./extension-updates/").forEach(file => {
      console.log(file);
    });

    const existTar = fs.existsSync("./extension-updates/test-extension-0.0.1.tgz");
    const existFolder = fs.existsSync("./extension-updates/test-extension-0.0.1");

    expect(existTar).toBeTruthy();
    expect(existFolder).toBeTruthy();
  });
});
