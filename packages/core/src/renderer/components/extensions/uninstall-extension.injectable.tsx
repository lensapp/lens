/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../extensions/extension-loader/extension-loader.injectable";
import extensionInstallationStateStoreInjectable from "../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import extensionDiscoveryInjectable from "../../../extensions/extension-discovery/extension-discovery.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { LensExtensionId } from "@k8slens/legacy-extensions";
import { extensionDisplayName } from "../../../extensions/lens-extension";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import { showSuccessNotificationInjectable, showErrorNotificationInjectable } from "@k8slens/notifications";

const uninstallExtensionInjectable = getInjectable({
  id: "uninstall-extension",

  instantiate: (di) => {
    const extensionLoader = di.inject(extensionLoaderInjectable);
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const logger = di.inject(loggerInjectionToken);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    return async (extensionId: LensExtensionId): Promise<boolean> => {
      const ext = extensionLoader.getExtensionById(extensionId);

      if (!ext) {
        logger.debug(`[EXTENSIONS]: cannot uninstall ${extensionId}, was not installed`);

        return true;
      }

      const { manifest } = ext;
      const displayName = extensionDisplayName(manifest.name, manifest.version);

      try {
        logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
        extensionInstallationStateStore.setUninstalling(extensionId);

        await extensionDiscovery.uninstallExtension(extensionId);

        // wait for the ExtensionLoader to actually uninstall the extension
        await when(() => !extensionLoader.userExtensions.get().has(extensionId));

        showSuccessNotification(
          <p>
            {"Extension "}
            <b>{displayName}</b>
            {" successfully uninstalled!"}
          </p>,
        );

        return true;
      } catch (error) {
        const message = getMessageFromError(error);

        logger.info(
          `[EXTENSION-UNINSTALL]: uninstalling ${displayName} has failed: ${error}`,
          { error },
        );
        showErrorNotification(
          <p>
            {"Uninstalling extension "}
            <b>{displayName}</b>
            {" has failed: "}
            <em>{message}</em>
          </p>,
        );

        return false;
      } finally {
      // Remove uninstall state on uninstall failure
        extensionInstallationStateStore.clearUninstalling(extensionId);
      }
    };
  },
});

export default uninstallExtensionInjectable;
