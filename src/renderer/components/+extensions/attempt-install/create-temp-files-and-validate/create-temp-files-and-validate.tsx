/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { validatePackage } from "../validate-package/validate-package";
import type { ExtensionDiscovery } from "../../../../../extensions/extension-discovery/extension-discovery";
import { getMessageFromError } from "../../get-message-from-error/get-message-from-error";
import logger from "../../../../../main/logger";
import { Notifications } from "../../../notifications";
import path from "path";
import fse from "fs-extra";
import React from "react";
import os from "os";
import type {
  LensExtensionId,
  LensExtensionManifest,
} from "../../../../../extensions/lens-extension";
import type { InstallRequest } from "../install-request";

export interface InstallRequestValidated {
  fileName: string;
  data: Buffer;
  id: LensExtensionId;
  manifest: LensExtensionManifest;
  tempFile: string; // temp system path to packed extension for unpacking
}

interface Dependencies {
  extensionDiscovery: ExtensionDiscovery;
}

export const createTempFilesAndValidate =
  ({ extensionDiscovery }: Dependencies) =>
    async ({
      fileName,
      dataP,
    }: InstallRequest): Promise<InstallRequestValidated | null> => {
      // copy files to temp
      await fse.ensureDir(getExtensionPackageTemp());

      // validate packages
      const tempFile = getExtensionPackageTemp(fileName);

      try {
        const data = await dataP;

        if (!data) {
          return null;
        }

        await fse.writeFile(tempFile, data);
        const manifest = await validatePackage(tempFile);
        const id = path.join(
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
        Notifications.error(
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


function getExtensionPackageTemp(fileName = "") {
  return path.join(os.tmpdir(), "lens-extensions", fileName);
}
