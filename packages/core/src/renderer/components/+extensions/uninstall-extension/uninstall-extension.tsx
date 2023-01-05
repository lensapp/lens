/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import type { LensExtensionId } from "../../../../extensions/lens-extension";
import { extensionDisplayName } from "../../../../extensions/lens-extension";
import logger from "../../../../main/logger";
import type { ExtensionDiscovery } from "../../../../extensions/extension-discovery/extension-discovery";
import { Notifications } from "../../notifications";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";
import type { ExtensionInstallationStateStore } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";

interface Dependencies {
  extensionLoader: ExtensionLoader;
  extensionDiscovery: ExtensionDiscovery;
  extensionInstallationStateStore: ExtensionInstallationStateStore;
}

export const uninstallExtension = ({
  extensionLoader,
  extensionDiscovery,
  extensionInstallationStateStore,
}: Dependencies) => (
  async (extensionId: LensExtensionId): Promise<boolean> => {
    const ext = extensionLoader.getExtension(extensionId);

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
      await when(() => !extensionLoader.userExtensions.has(extensionId));

      Notifications.ok(
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
      Notifications.error(
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
  }
);
