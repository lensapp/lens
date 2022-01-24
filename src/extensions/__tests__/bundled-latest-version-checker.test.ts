/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DownloadFileOptions } from "../../renderer/utils";
import { BundledVersionChecker } from "../bundled-latest-version-checker";

process.env.BUNDLED_EXTENSIONS_URL = "https://someurl.com/versions.json";

describe("BundledExtensionsVersionChecker", () => {
  it("returns for non-bundled extensions", async () => {
    const checker = new BundledVersionChecker();

    const version = await checker.getLatestVersion({
      name: "foo",
      version: "1.0.0"
    });

    expect(version).toBeNull();
  });

  it("returns null if json file not found", async () => {
    const downloadJson = (args: DownloadFileOptions) => {
      expect(args).toEqual({
        url: process.env.BUNDLED_EXTENSIONS_URL,
      });

      return { promise: new Promise((resolve, reject) => {
        reject({ url: process.env.BUNDLED_EXTENSIONS_URL, error: "File not found" })
      }) };
    };

    const checker = new BundledVersionChecker(downloadJson);

    const version = await checker.getLatestVersion({
      name: "foo",
      version: "1.0.0"
    }, true);

    expect(version).toBeNull();
  })

  it("returns null if extension name not found in file", async () => {
    const downloadJson = (args: DownloadFileOptions) => {
      expect(args).toEqual({
        url: process.env.BUNDLED_EXTENSIONS_URL,
      });

      return { promise: new Promise((resolve) => {
        resolve({
          "sample-foo": "v4.4.0",
          "sample-bar": "1.0.0"
        });
      }) };
    };

    const checker = new BundledVersionChecker(downloadJson);

    const version = await checker.getLatestVersion({
      name: "crd-extension",
      version: "1.0.0"
    }, true);

    expect(version).toBeNull();
  });

  it("fetches latest version from remote json file", async () => {
    const downloadJson = (args: DownloadFileOptions) => {
      expect(args).toEqual({
        url: process.env.BUNDLED_EXTENSIONS_URL,
      });

      return { promise: new Promise((resolve) => {
        resolve({
          "sample-foo": "v4.4.0",
          "sample-bar": "1.0.1"
        });
      }) };
    };

    const checker = new BundledVersionChecker(downloadJson);

    const version = await checker.getLatestVersion({
      name: "sample-bar",
      version: "1.0.0"
    }, true);

    expect(version).toMatchObject({
      input: `${process.env.BUNDLED_EXTENSIONS_URL}/sample-bar-1.0.1.tar`,
      version: "1.0.1"
    })
  })
})