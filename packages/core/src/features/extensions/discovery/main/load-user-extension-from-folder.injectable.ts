/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import pathExistsInjectable from "../../../../common/fs/path-exists.injectable";
import readJsonFileInjectable from "../../../../common/fs/read-json-file.injectable";
import getDirnameOfPathInjectable from "../../../../common/path/get-dirname.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import { isErrnoException } from "../../../../common/utils";
import { manifestFilename } from "../../../../common/vars";
import isProductionInjectable from "../../../../common/vars/is-production.injectable";
import isCompatibleExtensionInjectable from "./is-compatible-extension.injectable";
import extensionsStoreInjectable from "../../../../extensions/extensions-store/extensions-store.injectable";
import extensionDiscoveryLoggerInjectable from "../common/logger.injectable";
import getExtensionInstallPathInjectable from "./get-extension-install-path.injectable";
import type { ExternalInstalledExtension, LensExtensionManifest } from "../../common/installed-extension";

export type LoadUserExtensionFromFolder = (folderPath: string) => Promise<ExternalInstalledExtension | null>;

const loadUserExtensionFromFolderInjectable = getInjectable({
  id: "load-user-extension-from-folder",
  instantiate: (di): LoadUserExtensionFromFolder => {
    const joinPaths = di.inject(joinPathsInjectable);
    const readJsonFile = di.inject(readJsonFileInjectable);
    const extensionsStore = di.inject(extensionsStoreInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const isProduction = di.inject(isProductionInjectable);
    const pathExists = di.inject(pathExistsInjectable);
    const isCompatibleExtension = di.inject(isCompatibleExtensionInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);
    const getExtensionInstallPath = di.inject(getExtensionInstallPathInjectable);

    return async (folderPath) => {
      const manifestPath = joinPaths(folderPath, manifestFilename);

      try {
        const manifest = await readJsonFile(manifestPath) as unknown as LensExtensionManifest;
        const id = joinPaths(getExtensionInstallPath(manifest.name), manifestFilename);
        const extensionDir = getDirnameOfPath(manifestPath);
        const npmPackage = joinPaths(extensionDir, `${manifest.name}-${manifest.version}.tgz`);
        const absolutePath = isProduction && await pathExists(npmPackage)
          ? npmPackage
          : extensionDir;

        return {
          id,
          absolutePath,
          manifestPath: id,
          manifest,
          isBundled: false,
          isEnabled: extensionsStore.isEnabled(id),
          isCompatible: isCompatibleExtension(manifest.engines.lens),
        };
      } catch (error) {
        if (isErrnoException(error) && error.code === "ENOTDIR") {
        // ignore this error, probably from .DS_Store file
          logger.debug(`failed to load extension manifest through a not-dir-like at ${manifestPath}`);
        } else {
          logger.error(`can't load extension manifest at ${manifestPath}: ${error}`);
        }

        return null;
      }
    };
  },
});

export default loadUserExtensionFromFolderInjectable;
