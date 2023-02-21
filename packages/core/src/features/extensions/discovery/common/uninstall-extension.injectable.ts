/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import removePathInjectable from "../../../../common/fs/remove.injectable";
import type { LensExtensionId } from "../../common/installed-extension";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import extensionDiscoveryLoggerInjectable from "./logger.injectable";
import removeExtensionSymlinkByNameInjectable from "./remove-extension-symlink-by-name.injectable";

/**
 * The application will detect the folder unlink and remove the extension from the UI automatically.
 * @param id The ID of the extension to uninstall.
 */
export type RemoveExtensionFiles = (id: LensExtensionId) => Promise<void>;

const removeExtensionFilesInjectable = getInjectable({
  id: "remove-extension-files",
  instantiate: (di): RemoveExtensionFiles => {
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const removePath = di.inject(removePathInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);
    const removeExtensionSymlinkByName = di.inject(removeExtensionSymlinkByNameInjectable);

    return async (id): Promise<void> => {
      const extension = installedExtensions.get(id);

      if (!extension) {
        return logger.warn(`could not uninstall extension, not found`, { id });
      }

      if (extension.isBundled) {
        return logger.warn(`could not uninstall extension, is bundled`, { id });
      }

      const { manifest, absolutePath } = extension;

      logger.info(`Uninstalling ${manifest.name}`);

      await removeExtensionSymlinkByName(manifest.name);

      // fs.remove does nothing if the path doesn't exist anymore
      await removePath(absolutePath);
    };
  },
});

export default removeExtensionFilesInjectable;
