/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionId } from "../../../../extensions/lens-extension";
import logger from "../../../../main/logger";
import type { ExtensionDiscovery } from "../../../../extensions/extension-discovery/extension-discovery";
import { Notifications } from "../../notifications";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";

interface Dependencies {
  extensionLoader: ExtensionLoader;
  extensionDiscovery: ExtensionDiscovery;
  setUninstalling: (extId: string) => void;
  clearUninstalling: (extId: string) => void;
}

export const uninstallExtension = ({ extensionLoader, extensionDiscovery, setUninstalling, clearUninstalling }: Dependencies) => (
  async (extensionId: LensExtensionId): Promise<boolean> => {
    const { manifest } = extensionLoader.getExtension(extensionId);
    const displayName = extensionDisplayName(manifest.name, manifest.version);

    try {
      logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
      setUninstalling(extensionId);

      await extensionDiscovery.uninstallExtension(extensionId);

      // wait for the ExtensionLoader to actually uninstall the extension
      await when(() => !extensionLoader.userExtensions.has(extensionId));

      Notifications.ok(
        <p>
          Extension <b>{displayName}</b> successfully uninstalled!
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
          Uninstalling extension <b>{displayName}</b> has failed:{" "}
          <em>{message}</em>
        </p>,
      );

      return false;
    } finally {
      // Remove uninstall state on uninstall failure
      clearUninstalling(extensionId);
    }
  }
);
