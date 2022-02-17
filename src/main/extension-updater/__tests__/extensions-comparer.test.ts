/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BundledExtensionComparer } from "../bundled-extension-comparer";

describe("BundledExtensionComparer", () => {
  it("Should return empty array if all extensions have equal versions", () => {
    const releaseExtensions = {
      "node-menu": "0.1.1",
      "survey": "0.1.1",
    };
    const availableExtensions = {
      "node-menu": "0.1.1",
      "survey": "0.1.1",
    };

    const downloads = new BundledExtensionComparer(releaseExtensions, availableExtensions, "https://myurl.com").getExtensionsToDownload();

    expect(downloads).toHaveLength(0);
  });

  it("Should return empty array if no extensions found in release list", () => {
    const availableExtensions = {
      "node-menu": "0.1.1",
      "survey": "0.1.1",
    };

    const downloads = new BundledExtensionComparer({}, availableExtensions, "https://myurl.com").getExtensionsToDownload();

    expect(downloads).toHaveLength(0);
  });

  it("Should return empty array if no extensions found in available list", () => {
    const releaseExtensions = {
      "node-menu": "0.1.1",
      "survey": "0.1.1",
    };

    const downloads = new BundledExtensionComparer(releaseExtensions, {}, "https://myurl.com").getExtensionsToDownload();

    expect(downloads).toHaveLength(0);
  });

  it("Should return extensions with never versions", () => {
    const releaseExtensions = {
      "node-menu": "0.1.1",
      "survey": "0.1.1",
    };
    const availableExtensions = {
      "node-menu": "0.1.1",
      "survey": "1.0.1",
    };

    const downloads = new BundledExtensionComparer(releaseExtensions, availableExtensions, "https://myurl.com").getExtensionsToDownload();

    expect(downloads).toEqual([{
      name: "survey",
      version: "1.0.1",
      downloadUrl: "https://myurl.com/survey-1.0.1.tgz",
    }]);
  });

  it("Should skip extensions not found in releases list", () => {
    const releaseExtensions = {
      "node-menu": "0.1.1",
    };
    const availableExtensions = {
      "node-menu": "0.1.1",
      "survey": "1.0.1",
    };

    const downloads = new BundledExtensionComparer(releaseExtensions, availableExtensions, "https://myurl.com").getExtensionsToDownload();

    expect(downloads).toHaveLength(0);
  });
});
