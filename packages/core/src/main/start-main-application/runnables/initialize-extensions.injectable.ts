/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import extensionDiscoveryInjectable from "../../../extensions/extension-discovery/extension-discovery.injectable";
import autoInitExtensionsInjectable from "../../../features/extensions/loader/common/auto-init-extensions.injectable";
import removeExtensionInstanceInjectable from "../../../features/extensions/loader/common/remove-instance.injectable";
import showErrorPopupInjectable from "../../electron-app/features/show-error-popup.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const initializeExtensionsInjectable = getInjectable({
  id: "initialize-extensions",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const showErrorPopup = di.inject(showErrorPopupInjectable);
    const removeExtensionInstance = di.inject(removeExtensionInstanceInjectable);
    const autoInitExtensions = di.inject(autoInitExtensionsInjectable);

    return {
      id: "initialize-extensions",
      run: async () => {
        logger.info("🧩 Initializing extensions");

        await extensionDiscovery.init();

        await autoInitExtensions();

        try {
          await extensionDiscovery.load();
          extensionDiscovery.events.on("remove", (ext) => removeExtensionInstance(ext.id));

          // Start watching after bundled extensions are loaded
          extensionDiscovery.watchExtensions();
        } catch (error: any) {
          showErrorPopup(
            "Lens Error",
            `Could not load extensions${error?.message ? `: ${error.message}` : ""}`,
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
