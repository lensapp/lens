/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getDirnameOfPathInjectable from "../../../../common/path/get-dirname.injectable";
import joinPathsInjectable from "../../../../common/path/join-paths.injectable";
import type { InstalledExtension } from "../../../../extensions/common-api";
import { extensionEntryPointNameInjectionToken } from "../../../../extensions/extension-loader/entry-point-name";
import type { LensExtensionConstructor } from "../../../../extensions/lens-extension";
import extensionLoadingLoggerInjectable from "./logger.injectable";

export type ImportInstalledExtension = (extension: InstalledExtension) => Promise<LensExtensionConstructor | null>;

const importInstalledExtensionInjectable = getInjectable({
  id: "import-installed-extension",
  instantiate: (di): ImportInstalledExtension => {
    const joinPaths = di.inject(joinPathsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const logger = di.inject(extensionLoadingLoggerInjectable);
    const extensionEntryPointName = di.inject(extensionEntryPointNameInjectionToken);

    return async (extension) => {
      const extRelativePath = extension.manifest[extensionEntryPointName];

      if (!extRelativePath) {
        return null;
      }

      const extAbsolutePath = joinPaths(getDirnameOfPath(extension.manifestPath), extRelativePath);

      try {
        const LensExtensionClass = (await import(extAbsolutePath)).default;

        if (typeof LensExtensionClass === "function") {
          return LensExtensionClass;
        }

        logger.error(`the ${extensionEntryPointName} entry point for "${extension.manifest.name}" is invalid`);
      } catch (error) {
        const message = (error instanceof Error ? error.stack : undefined) || error;

        logger.error(`can't load ${extensionEntryPointName} for "${extension.manifest.name}": ${message}`, { extension });
      }

      return null;
    };
  },
  causesSideEffects: true,
});

export default importInstalledExtensionInjectable;
