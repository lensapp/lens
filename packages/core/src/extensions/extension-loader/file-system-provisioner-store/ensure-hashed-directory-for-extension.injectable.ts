/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";

import { getOrInsert } from "@k8slens/utilities";
import randomBytesInjectable from "../../../common/utils/random-bytes.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import directoryForExtensionDataInjectable from "./directory-for-extension-data.injectable";
import ensureDirInjectable from "../../../common/fs/ensure-dir.injectable";
import getHashInjectable from "./get-hash.injectable";
import getPathToLegacyPackageJsonInjectable from "./get-path-to-legacy-package-json.injectable";
import { registeredExtensionsInjectable } from "./registered-extensions.injectable";

export type EnsureHashedDirectoryForExtension = (extensionName: string) => Promise<string>;

const ensureHashedDirectoryForExtensionInjectable = getInjectable({
  id: "ensure-hashed-directory-for-extension",

  instantiate: (di): EnsureHashedDirectoryForExtension => {
    const randomBytes = di.inject(randomBytesInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForExtensionData = di.inject(directoryForExtensionDataInjectable);
    const ensureDirectory = di.inject(ensureDirInjectable);
    const getHash = di.inject(getHashInjectable);
    const getPathToLegacyPackageJson = di.inject(getPathToLegacyPackageJsonInjectable);
    const registeredExtensions = di.inject(registeredExtensionsInjectable);

    return async (extensionName) => {
      let dirPath: string;

      const legacyDirPath = getPathToLegacyPackageJson(extensionName);
      const hashedDirectoryForLegacyDirPath = registeredExtensions.get(legacyDirPath);

      if (hashedDirectoryForLegacyDirPath) {
        registeredExtensions.set(extensionName, hashedDirectoryForLegacyDirPath);
        registeredExtensions.delete(legacyDirPath);
        dirPath = hashedDirectoryForLegacyDirPath;
      } else {
        const salt = randomBytes(32).toString("hex");
        const hashedName = getHash(`${extensionName}/${salt}`);

        const hashedExtensionDirectory = joinPaths(directoryForExtensionData, hashedName);

        dirPath = getOrInsert(registeredExtensions, extensionName, hashedExtensionDirectory);
      }

      await ensureDirectory(dirPath);

      return dirPath;
    };
  },
});

export default ensureHashedDirectoryForExtensionInjectable;
