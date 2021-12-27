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
import type { InstallRequestValidated } from "../create-temp-files-and-validate/create-temp-files-and-validate";
import { Disposer, extractTar, noop } from "../../../../../common/utils";
import { ExtensionInstallationStateStore } from "../../extension-install.store";
import { extensionDisplayName } from "../../../../../extensions/lens-extension";
import logger from "../../../../../main/logger";
import type { ExtensionLoader } from "../../../../../extensions/extension-loader";
import { Notifications } from "../../../notifications";
import { getMessageFromError } from "../../get-message-from-error/get-message-from-error";
import { getExtensionDestFolder } from "../get-extension-dest-folder/get-extension-dest-folder";
import path from "path";
import fse from "fs-extra";
import { when } from "mobx";
import React from "react";

interface Dependencies {
  extensionLoader: ExtensionLoader
}

export const unpackExtension = ({ extensionLoader }: Dependencies) => async (
  request: InstallRequestValidated,
  disposeDownloading?: Disposer,
) => {
  const {
    id,
    fileName,
    tempFile,
    manifest: { name, version },
  } = request;

  ExtensionInstallationStateStore.setInstalling(id);
  disposeDownloading?.();

  const displayName = extensionDisplayName(name, version);
  const extensionFolder = getExtensionDestFolder(name);
  const unpackingTempFolder = path.join(
    path.dirname(tempFile),
    `${path.basename(tempFile)}-unpacked`,
  );

  logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

  try {
    // extract to temp folder first
    await fse.remove(unpackingTempFolder).catch(noop);
    await fse.ensureDir(unpackingTempFolder);
    await extractTar(tempFile, { cwd: unpackingTempFolder });

    // move contents to extensions folder
    const unpackedFiles = await fse.readdir(unpackingTempFolder);
    let unpackedRootFolder = unpackingTempFolder;

    if (unpackedFiles.length === 1) {
      // check if %extension.tgz was packed with single top folder,
      // e.g. "npm pack %ext_name" downloads file with "package" root folder within tarball
      unpackedRootFolder = path.join(unpackingTempFolder, unpackedFiles[0]);
    }

    await fse.ensureDir(extensionFolder);
    await fse.move(unpackedRootFolder, extensionFolder, { overwrite: true });

    // wait for the loader has actually install it
    await when(() => extensionLoader.userExtensions.has(id));

    // Enable installed extensions by default.
    extensionLoader.setIsEnabled(id, true);

    Notifications.ok(
      <p>
        Extension <b>{displayName}</b> successfully installed!
      </p>,
    );
  } catch (error) {
    const message = getMessageFromError(error);

    logger.info(
      `[EXTENSION-INSTALLATION]: installing ${request.fileName} has failed: ${message}`,
      { error },
    );
    Notifications.error(
      <p>
        Installing extension <b>{displayName}</b> has failed: <em>{message}</em>
      </p>,
    );
  } finally {
    // Remove install state once finished
    ExtensionInstallationStateStore.clearInstalling(id);

    // clean up
    fse.remove(unpackingTempFolder).catch(noop);
    fse.unlink(tempFile).catch(noop);
  }
};
