/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { InstalledExtension } from "../../../extensions/extension-discovery/extension-discovery";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import loggerInjectable from "../../../common/logger.injectable";
import extensionDiscoveryInjectable from "../../../extensions/extension-discovery/extension-discovery.injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import showErrorPopupInjectable from "../../electron-app/features/show-error-popup.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const initializeExtensionsInjectable = getInjectable({
  id: "initialize-extensions",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const extensionLoader = di.inject(extensionLoaderInjectable);
    const showErrorPopup = di.inject(showErrorPopupInjectable);

    return {
      id: "initialize-extensions",
      run: async () => {
        logger.info("🧩 Initializing extensions");

        await extensionDiscovery.init();

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
        } catch (error: any) {
          showErrorPopup(
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

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default initializeExtensionsInjectable;
