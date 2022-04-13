/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import loggerInjectable from "../../../../common/logger.injectable";
import extensionDiscoveryInjectable from "../../../../extensions/extension-discovery/extension-discovery.injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { dialog } from "electron";

const initializeExtensionsInjectable = getInjectable({
  id: "initialize-extensions",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const extensionLoader = di.inject(extensionLoaderInjectable);

    return {
      run: async () => {
        logger.info("🧩 Initializing extensions");

        await extensionLoader.init();

        try {
          const extensions = await extensionDiscovery.load();

          // Start watching after bundled extensions are loaded
          extensionDiscovery.watchExtensions();

          // Subscribe to extensions that are copied or deleted to/from the extensions folder
          extensionDiscovery.events
            .on("add", (extension: InstalledExtension) => {
              extensionLoader.addExtension(extension);
            })
            .on("remove", (lensExtensionId: LensExtensionId) => {
              extensionLoader.removeExtension(lensExtensionId);
            });

          extensionLoader.initExtensions(extensions);
        } catch (error) {
          dialog.showErrorBox(
            "Lens Error",
            `Could not load extensions${
              error?.message ? `: ${error.message}` : ""
            }`,
          );
          console.error(error);
          console.trace();
        }
      },
    };
  },

  causesSideEffects: true,

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default initializeExtensionsInjectable;
