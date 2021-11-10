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
import { validatePackage } from "../validate-package/validate-package";
import { ExtensionDiscovery } from "../../../../../extensions/extension-discovery";
import { getMessageFromError } from "../../get-message-from-error/get-message-from-error";
import logger from "../../../../../common/logger";
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

export async function createTempFilesAndValidate({
  fileName,
  dataP,
}: InstallRequest): Promise<InstallRequestValidated | null> {
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
      ExtensionDiscovery.getInstance().nodeModulesPath,
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
          Installing <em>{fileName}</em> has failed, skipping.
        </p>
        <p>
          Reason: <em>{message}</em>
        </p>
      </div>,
    );
  }

  return null;
}


function getExtensionPackageTemp(fileName = "") {
  return path.join(os.tmpdir(), "lens-extensions", fileName);
}
