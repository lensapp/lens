/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import { extensionDisplayName } from "../../../extensions/lens-extension";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "./get-message-from-error/get-message-from-error";
import showSuccessNotificationInjectable from "../notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import installedUserExtensionsInjectable from "../../../features/extensions/common/user-extensions.injectable";
import getInstalledExtensionInjectable from "../../../features/extensions/common/get-installed-extension.injectable";
import removeExtensionFilesInjectable from "../../../features/extensions/discovery/common/uninstall-extension.injectable";
import clearExtensionAsInstallingInjectable from "../../../features/extensions/installation-states/renderer/clear-as-installing.injectable";
import setExtensionAsUninstallingInjectable from "../../../features/extensions/installation-states/renderer/set-as-uninstalling.injectable";

const uninstallExtensionInjectable = getInjectable({
  id: "uninstall-extension",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const installedUserExtensions = di.inject(installedUserExtensionsInjectable);
    const getInstalledExtension = di.inject(getInstalledExtensionInjectable);
    const removeExtensionFiles = di.inject(removeExtensionFilesInjectable);
    const clearExtensionAsInstalling = di.inject(clearExtensionAsInstallingInjectable);
    const setExtensionAsUninstalling = di.inject(setExtensionAsUninstallingInjectable);

    return async (extensionId: LensExtensionId): Promise<boolean> => {
      const ext = getInstalledExtension(extensionId);

      if (!ext) {
        logger.debug(`[EXTENSIONS]: cannot uninstall ${extensionId}, was not installed`);

        return true;
      }

      const { manifest } = ext;
      const displayName = extensionDisplayName(manifest.name, manifest.version);

      try {
        logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);

        setExtensionAsUninstalling(extensionId);
        await removeExtensionFiles(extensionId);

        // wait for the ExtensionLoader to actually uninstall the extension
        await when(() => !installedUserExtensions.get().has(extensionId));

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
        clearExtensionAsInstalling(extensionId);
      }
    };
  },
});

export default uninstallExtensionInjectable;
