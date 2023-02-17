/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getBasenameOfPathInjectable from "../../../../common/path/get-basename.injectable";
import getDirnameOfPathInjectable from "../../../../common/path/get-dirname.injectable";
import getRelativePathInjectable from "../../../../common/path/get-relative-path.injectable";
import fileSystemSeparatorInjectable from "../../../../common/path/separator.injectable";
import { manifestFilename } from "../../../../common/vars";
import extensionInstallationStateStoreInjectable from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import installExtensionPackageInjectable from "../common/install-package.injectable";
import localExtensionsDirectoryPathInjectable from "../common/local-extensions-directory-path.injectable";
import extensionDiscoveryLoggerInjectable from "../common/logger.injectable";
import loadUserExtensionFromFolderInjectable from "./load-user-extension-from-folder.injectable";

const extensionFileAddedInjectable = getInjectable({
  id: "extension-file-added",
  instantiate: (di) => {
    const getRelativePath = di.inject(getRelativePathInjectable);
    const localExtensionsDirectoryPath = di.inject(localExtensionsDirectoryPathInjectable);
    const fileSystemSeparator = di.inject(fileSystemSeparatorInjectable);
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const loadUserExtensionFromFolder = di.inject(loadUserExtensionFromFolderInjectable);
    const installExtensionPackage = di.inject(installExtensionPackageInjectable);
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);

    return async (manifestPath: string): Promise<void> => {
      // e.g. "foo/package.json"
      const relativePath = getRelativePath(localExtensionsDirectoryPath, manifestPath);

      // Converts "foo/package.json" to ["foo", "package.json"], where length of 2 implies
      // that the added file is in a folder under local folder path.
      // This safeguards against a file watch being triggered under a sub-directory which is not an extension.
      const isUnderLocalFolderPath = relativePath.split(fileSystemSeparator).length === 2;

      if (getBasenameOfPath(manifestPath) === manifestFilename && isUnderLocalFolderPath) {
        try {
          extensionInstallationStateStore.setInstallingFromMain(manifestPath);
          const absPath = getDirnameOfPath(manifestPath);

          // this.loadExtensionFromPath updates this.packagesJson
          const extension = await loadUserExtensionFromFolder(absPath);

          if (extension) {
          // Install dependencies for the new extension
            await installExtensionPackage(extension.absolutePath);

            installedExtensions.set(extension.id, extension);
            logger.info(`Added extension ${extension.manifest.name}`);
          }
        } catch (error) {
          logger.error(`failed to add extension: ${error}`, { error });
        } finally {
          extensionInstallationStateStore.clearInstallingFromMain(manifestPath);
        }
      }
    };
  },
});

export default extensionFileAddedInjectable;
