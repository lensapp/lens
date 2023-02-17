/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stats } from "fs-extra";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import ensureDirectoryInjectable from "../../../../common/fs/ensure-directory.injectable";
import lstatInjectable from "../../../../common/fs/lstat.injectable";
import readDirectoryInjectable from "../../../../common/fs/read-directory.injectable";
import removePathInjectable from "../../../../common/fs/remove.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import { isErrnoException } from "../../../../common/utils";
import type { InstalledExtension } from "../../../../extensions/extension-discovery/extension-discovery";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import extensionsNodeModulesDirectoryPathInjectable from "../common/extension-node-modules-directory-path.injectable";
import initialDiscoveryLoadCompletedInjectable from "../common/initial-load-completed.injectable";
import localExtensionsDirectoryPathInjectable from "../common/local-extensions-directory-path.injectable";
import extensionDiscoveryLoggerInjectable from "../common/logger.injectable";
import loadUserExtensionFromFolderInjectable from "./load-user-extension-from-folder.injectable";

/**
 * Returns true if the lstat is for a directory-like file (e.g. isDirectory or symbolic link)
 * @param lstat the stats to compare
 */
const isDirectoryLike = (lstat: Stats) => lstat.isDirectory() || lstat.isSymbolicLink();

export type LoadInitialExtensions = () => Promise<void>;

const loadInitialExtensionsInjectable = getInjectable({
  id: "load-initial-extensions",
  instantiate: (di): LoadInitialExtensions => {
    const directoryForUserData = di.inject(directoryForUserDataInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);
    const removePath = di.inject(removePathInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const ensureDirectory = di.inject(ensureDirectoryInjectable);
    const readDirectory = di.inject(readDirectoryInjectable);
    const lstat = di.inject(lstatInjectable);
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const initialDiscoveryLoadCompleted = di.inject(initialDiscoveryLoadCompletedInjectable);
    const extensionsNodeModulesDirectoryPath = di.inject(extensionsNodeModulesDirectoryPathInjectable);
    const localExtensionsDirectoryPath = di.inject(localExtensionsDirectoryPathInjectable);
    const loadUserExtensionFromFolder = di.inject(loadUserExtensionFromFolderInjectable);

    return async () => {
      logger.info(`loading extensions from ${directoryForUserData}`);

      await removePath(joinPaths(directoryForUserData, "package-lock.json"));
      await ensureDirectory(extensionsNodeModulesDirectoryPath);
      await ensureDirectory(localExtensionsDirectoryPath);

      const userExtensions: InstalledExtension[] = [];
      const paths = await readDirectory(localExtensionsDirectoryPath);

      for (const fileName of paths) {
        const absPath = joinPaths(localExtensionsDirectoryPath, fileName);

        try {
          const stats = await lstat(absPath);

          // skip non-directories
          if (!isDirectoryLike(stats)) {
            continue;
          }
        } catch (error) {
          if (isErrnoException(error) && error.code === "ENOENT") {
            continue;
          }

          throw error;
        }

        const extension = await loadUserExtensionFromFolder(absPath);

        if (extension) {
          userExtensions.push(extension);
        }
      }

      logger.debug(`${userExtensions.length} extensions loaded from "${localExtensionsDirectoryPath}"`, userExtensions.map(ext => `${ext.manifest.name}@${ext.manifest.version}`));

      installedExtensions.replace(userExtensions.map(ext => [ext.id, ext]));
      initialDiscoveryLoadCompleted.set(true);
    };
  },
});

export default loadInitialExtensionsInjectable;
