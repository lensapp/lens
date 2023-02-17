/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getBasenameOfPathInjectable from "../../../../common/path/get-basename.injectable";
import getRelativePathInjectable from "../../../../common/path/get-relative-path.injectable";
import { iter } from "../../../../common/utils";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import removeExtensionInstanceInjectable from "../../loader/common/remove-instance.injectable";
import localExtensionsDirectoryPathInjectable from "../common/local-extensions-directory-path.injectable";
import extensionDiscoveryLoggerInjectable from "../common/logger.injectable";
import removeExtensionSymlinkByNameInjectable from "../common/remove-extension-symlink-by-name.injectable";

const extensionFileRemovedInjectable = getInjectable({
  id: "extension-file-removed",
  instantiate: (di) => {
    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const getRelativePath = di.inject(getRelativePathInjectable);
    const removeExtensionSymlinkByName = di.inject(removeExtensionSymlinkByNameInjectable);
    const removeExtensionInstance = di.inject(removeExtensionInstanceInjectable);
    const localExtensionsDirectoryPath = di.inject(localExtensionsDirectoryPathInjectable);
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);

    return async (filePath: string): Promise<void> => {
      // Check that the removed path is directly under this.dependencies.localExtensionsDirectoryPath
      // Note that the watcher can create unlink events for subdirectories of the extension
      const extensionFolderName = getBasenameOfPath(filePath);
      const expectedPath = getRelativePath(localExtensionsDirectoryPath, filePath);

      if (expectedPath !== extensionFolderName) {
        return;
      }

      const extension = iter.find(
        installedExtensions.values(),
        (ext) => !ext.isBundled && ext.absolutePath === filePath,
      );

      if (!extension) {
        logger.warn(`extension ${extensionFolderName} not found, can't remove`);

        return;
      }

      // If the extension is deleted manually while the application is running, also remove the symlink
      await removeExtensionSymlinkByName(extension.manifest.name);

      installedExtensions.delete(extension.id);
      logger.info(`removed extension ${extension.manifest.name}`);
      removeExtensionInstance(extension.id);
    };
  },
});

export default extensionFileRemovedInjectable;
