/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import { extensionDisplayName, LensExtensionId } from "../../../../extensions/lens-extension";
import logger from "../../../../main/logger";
import { ExtensionInstallationStateStore } from "../extension-install.store";
import { ExtensionDiscovery } from "../../../../extensions/extension-discovery";
import { Notifications } from "../../notifications";
import React from "react";
import { when } from "mobx";
import { getMessageFromError } from "../get-message-from-error/get-message-from-error";

export interface Dependencies {
  extensionLoader: ExtensionLoader
}

export const uninstallExtension =
  ({ extensionLoader }: Dependencies) =>
    async (extensionId: LensExtensionId): Promise<boolean> => {
      const { manifest } = extensionLoader.getExtension(extensionId);
      const displayName = extensionDisplayName(manifest.name, manifest.version);

      try {
        logger.debug(`[EXTENSIONS]: trying to uninstall ${extensionId}`);
        ExtensionInstallationStateStore.setUninstalling(extensionId);

        await ExtensionDiscovery.getInstance().uninstallExtension(extensionId);

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
        ExtensionInstallationStateStore.clearUninstalling(extensionId);
      }
    };
