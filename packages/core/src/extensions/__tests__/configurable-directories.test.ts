/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { runInAction } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import getHashInjectable from "../../extensions/extension-loader/file-system-provisioner-store/get-hash.injectable";
import fsInjectable from "../../common/fs/fs.injectable";

describe("configurable directories for extension files", () => {
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      runInAction(() => {
        mainDi.override(getHashInjectable, () => x => x);
      });
    });

    await builder.startHidden();

    const window = builder.applicationWindow.create("some-window-id");

    await window.start();

  });

  describe("when extension with a specific store name is enabled", () => {
    let testExtensionOptions: FakeExtensionOptions;

    beforeEach(() => {

      testExtensionOptions = {
        id: "some-extension",
        name: "some-extension-name",

        mainOptions: {
          manifest: {
            name: "irrelevant",
            storeName: "some-specific-store-name",
            version: "0",
            engines: {
              lens: "0",
            },
          },
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("creates extension directory for specific store name", async () => {
      const fs = builder.mainDi.inject(fsInjectable);

      await builder.extensions.get("some-extension").main.getExtensionFileFolder();

      const nonHashedExtensionDirectories = await fs.readdir("/some-directory-for-app-data/some-product-name/extension_data");

      expect(nonHashedExtensionDirectories).toContain("some-specific-store-name");
    });
  });

  describe("when extension with no specific store name is enabled", () => {
    let testExtensionOptions: FakeExtensionOptions;

    beforeEach(() => {

      testExtensionOptions = {
        id: "some-extension",
        name: "some-extension-name",

        mainOptions: {
          manifest: {
            name: "some-package-name",
            storeName: undefined,
            version: "0",
            engines: {
              lens: "0",
            },
          },
        },
      };

      builder.extensions.enable(testExtensionOptions);
    });

    it("creates extension directory for package name", async () => {
      const fs = builder.mainDi.inject(fsInjectable);

      await builder.extensions.get("some-extension").main.getExtensionFileFolder();

      const nonHashedExtensionDirectories = await fs.readdir("/some-directory-for-app-data/some-product-name/extension_data");

      expect(nonHashedExtensionDirectories).toContain("some-package-name");
    });
  });
});
