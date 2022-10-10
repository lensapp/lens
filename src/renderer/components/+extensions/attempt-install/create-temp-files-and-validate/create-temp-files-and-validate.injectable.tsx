/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionDiscoveryInjectable from "../../../../../extensions/extension-discovery/extension-discovery.injectable";
import React from "react";
import type { LensExtensionId, LensExtensionManifest } from "../../../../../extensions/lens-extension";
import { getMessageFromError } from "../../get-message-from-error/get-message-from-error";
import type { InstallRequest } from "../install-request";
import { validatePackage } from "../validate-package/validate-package";
import joinPathsInjectable from "../../../../../common/path/join-paths.injectable";
import tempDirectoryPathInjectable from "../../../../../common/os/temp-directory-path.injectable";
import ensureDirInjectable from "../../../../../common/fs/ensure-dir.injectable";
import writeFileInjectable from "../../../../../common/fs/write-file.injectable";
import loggerInjectable from "../../../../../common/logger.injectable";
import showErrorNotificationInjectable from "../../../notifications/show-error-notification.injectable";

export interface InstallRequestValidated {
  fileName: string;
  data: Buffer;
  id: LensExtensionId;
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

export type CreateTempFilesAndValidate = (req: InstallRequest) => Promise<InstallRequestValidated | null>;

const createTempFilesAndValidateInjectable = getInjectable({
  id: "create-temp-files-and-validate",

  instantiate: (di) => {
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const tempDirectoryPath = di.inject(tempDirectoryPathInjectable);
    const ensureDir = di.inject(ensureDirInjectable);
    const writeFile = di.inject(writeFileInjectable);
    const logger = di.inject(loggerInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);

    const baseTempExtensionsDirectory = joinPaths(tempDirectoryPath, "lens-extensions");
    const getExtensionPackageTemp = (fileName: string) => joinPaths(baseTempExtensionsDirectory, fileName);

    return async ({
      fileName,
      dataP,
    }: InstallRequest): Promise<InstallRequestValidated | null> => {
      // copy files to temp
      await ensureDir(baseTempExtensionsDirectory);

      // validate packages
      const tempFile = getExtensionPackageTemp(fileName);

      try {
        const data = await dataP;

        if (!data) {
          return null;
        }

        await writeFile(tempFile, data);
        logger.info("validating package", tempFile);
        const manifest = await validatePackage(tempFile);
        const id = joinPaths(
          extensionDiscovery.nodeModulesPath,
          manifest.name,
          "package.json",
        );

        return {
          fileName,
          data,
          manifest,
          tempFile,
          id,
        };
      } catch (error) {
        const message = getMessageFromError(error);

        logger.info(
          `[EXTENSION-INSTALLATION]: installing ${fileName} has failed: ${message}`,
          { error },
        );
        showErrorNotification(
          <div className="flex column gaps">
            <p>
              {"Installing "}
              <em>{fileName}</em>
              {" has failed, skipping."}
            </p>
            <p>
              {"Reason: "}
              <em>{message}</em>
            </p>
          </div>,
        );
      }

      return null;
    };
  },
});

export default createTempFilesAndValidateInjectable;
