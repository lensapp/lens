/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../../extensions/extension-loader/extension-loader.injectable";
import getExtensionDestFolderInjectable from "../get-extension-dest-folder/get-extension-dest-folder.injectable";
import extensionInstallationStateStoreInjectable from "../../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import type { InstallRequestValidated } from "../create-temp-files-and-validate/create-temp-files-and-validate.injectable";
import type { Disposer } from "../../../../utils";
import { noop } from "../../../../utils";
import { extensionDisplayName } from "../../../../../extensions/lens-extension";
import joinPathsInjectable from "../../../../../common/path/join-paths.injectable";
import loggerInjectable from "../../../../../common/logger.injectable";
import { when } from "mobx";
import { getMessageFromError } from "../../get-message-from-error/get-message-from-error";
import showSuccessNotificationInjectable from "../../../notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../../../notifications/show-error-notification.injectable";
import getDirnameOfPathInjectable from "../../../../../common/path/get-dirname.injectable";
import getBasenameOfPathInjectable from "../../../../../common/path/get-basename.injectable";
import extractTarInjectable from "../../../../../common/fs/extract-tar.injectable";
import ensureDirInjectable from "../../../../../common/fs/ensure-dir.injectable";
import removePathInjectable from "../../../../../common/fs/remove-path.injectable";
import deleteFileInjectable from "../../../../../common/fs/delete-file.injectable";
import readDirectoryInjectable from "../../../../../common/fs/read-directory.injectable";
import moveInjectable from "../../../../../common/fs/move.injectable";

export type UnpackExtension = (request: InstallRequestValidated, disposeDownloading?: Disposer) => Promise<void>;

const unpackExtensionInjectable = getInjectable({
  id: "unpack-extension",

  instantiate: (di): UnpackExtension => {
    const extensionLoader = di.inject(extensionLoaderInjectable);
    const getExtensionDestFolder = di.inject(getExtensionDestFolderInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const logger = di.inject(loggerInjectable);
    const showOkNotification = di.inject(showSuccessNotificationInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const extractTar = di.inject(extractTarInjectable);
    const ensureDir = di.inject(ensureDirInjectable);
    const removePath = di.inject(removePathInjectable);
    const deleteFile = di.inject(deleteFileInjectable);
    const readDirectory = di.inject(readDirectoryInjectable);
    const move = di.inject(moveInjectable);

    return async (request, disposeDownloading) => {
      const {
        id,
        fileName,
        tempFile,
        manifest: { name, version },
      } = request;

      extensionInstallationStateStore.setInstalling(id);
      disposeDownloading?.();

      const displayName = extensionDisplayName(name, version);
      const extensionFolder = getExtensionDestFolder(name);
      const unpackingTempFolder = joinPaths(
        getDirnameOfPath(tempFile),
        `${getBasenameOfPath(tempFile)}-unpacked`,
      );

      logger.info(`Unpacking extension ${displayName}`, { fileName, tempFile });

      try {
        // extract to temp folder first
        await removePath(unpackingTempFolder).catch(noop);
        await ensureDir(unpackingTempFolder);
        await extractTar(tempFile, { cwd: unpackingTempFolder });

        // move contents to extensions folder
        const unpackedFiles = await readDirectory(unpackingTempFolder);
        let unpackedRootFolder = unpackingTempFolder;

        if (unpackedFiles.length === 1) {
        // check if %extension.tgz was packed with single top folder,
        // e.g. "npm pack %ext_name" downloads file with "package" root folder within tarball
          unpackedRootFolder = joinPaths(unpackingTempFolder, unpackedFiles[0]);
        }

        await ensureDir(extensionFolder);
        await move(unpackedRootFolder, extensionFolder, { overwrite: true });

        // wait for the loader has actually install it
        await when(() => extensionLoader.userExtensions.has(id));

        // Enable installed extensions by default.
        extensionLoader.setIsEnabled(id, true);

        showOkNotification(
          <p>
            {"Extension "}
            <b>{displayName}</b>
            {" successfully installed!"}
          </p>,
        );
      } catch (error) {
        const message = getMessageFromError(error);

        logger.info(
          `[EXTENSION-INSTALLATION]: installing ${request.fileName} has failed: ${message}`,
          { error },
        );
        showErrorNotification(
          <p>
            {"Installing extension "}
            <b>{displayName}</b>
            {" has failed: "}
            <em>{message}</em>
          </p>,
        );
      } finally {
        // Remove install state once finished
        extensionInstallationStateStore.clearInstalling(id);

        // clean up
        removePath(unpackingTempFolder).catch(noop);
        deleteFile(tempFile).catch(noop);
      }
    };
  },
});

export default unpackExtensionInjectable;
