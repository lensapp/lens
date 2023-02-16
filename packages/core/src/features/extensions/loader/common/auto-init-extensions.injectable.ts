/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import type { ExtensionLoading } from "./finalize-extension-loading.injectable";
import finalizeExtensionLoadingInjectable from "./finalize-extension-loading.injectable";
import loadBundledExtensionsInjectable from "./load-bundled-extensions.injectable";
import loadUserExtensionsInjectable from "./load-user-extensions.injectable";
import extensionLoadingLoggerInjectable from "./logger.injectable";

export type AutoInitExtensions = () => Promise<ExtensionLoading[]>;

const autoInitExtensionsInjectable = getInjectable({
  id: "auto-init-extensions",
  instantiate: (di): AutoInitExtensions => {
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const logger = di.inject(extensionLoadingLoggerInjectable);
    const loadBundledExtensions = di.inject(loadBundledExtensionsInjectable);
    const loadUserExtensions = di.inject(loadUserExtensionsInjectable);
    const finalizeExtensionLoading = di.inject(finalizeExtensionLoadingInjectable);

    return async () => {
      logger.info("auto initializing extensions");

      const bundledExtensions = await loadBundledExtensions();
      const userExtensions = await loadUserExtensions(installedExtensions.toJSON());
      const loadedExtensions = await finalizeExtensionLoading([
        ...bundledExtensions,
        ...userExtensions,
      ]);

      // Setup reaction to load extensions on JSON changes
      reaction(() => installedExtensions.toJSON(), installedExtensions => {
        void (async () => {
          const userExtensions = await loadUserExtensions(installedExtensions);

          await finalizeExtensionLoading(userExtensions);
        })();
      });

      return loadedExtensions;
    };
  },
});

export default autoInitExtensionsInjectable;
