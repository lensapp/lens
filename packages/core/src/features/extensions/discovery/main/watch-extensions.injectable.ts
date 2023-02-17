/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import watchInjectable from "../../../../common/fs/watch/watch.injectable";
import localExtensionsDirectoryPathInjectable from "../common/local-extensions-directory-path.injectable";
import extensionDiscoveryLoggerInjectable from "../common/logger.injectable";
import extensionFileAddedInjectable from "./extension-file-add.injectable";
import extensionFileRemovedInjectable from "./extension-file-removed.injectable";

export type WatchForExtensions = () => void;

const watchForExtensionsInjectable = getInjectable({
  id: "watch-for-extensions",
  instantiate: (di): WatchForExtensions => {
    const extensionFileAdded = di.inject(extensionFileAddedInjectable);
    const extensionFileRemoved = di.inject(extensionFileRemovedInjectable);
    const logger = di.inject(extensionDiscoveryLoggerInjectable);
    const watch = di.inject(watchInjectable);
    const localExtensionsDirectoryPath = di.inject(localExtensionsDirectoryPathInjectable);

    return () => {
      logger.info(`watching extension add/remove in ${localExtensionsDirectoryPath}`);

      watch(localExtensionsDirectoryPath, {
        // For adding and removing symlinks to work, the depth has to be 1.
        depth: 1,
        ignoreInitial: true,
        // Try to wait until the file has been completely copied.
        // The OS might emit an event for added file even it's not completely written to the file-system.
        awaitWriteFinish: {
          // Wait 300ms until the file size doesn't change to consider the file written.
          // For a small file like package.json this should be plenty of time.
          stabilityThreshold: 300,
        },
      })
        // Extension add is detected by watching "<extensionDir>/package.json" add
        .on("add", extensionFileAdded)
        // Extension remove is detected by watching "<extensionDir>" unlink
        .on("unlinkDir", extensionFileRemoved)
        // Extension remove is detected by watching "<extensionSymLink>" unlink
        .on("unlink", extensionFileRemoved);
    };
  },
  causesSideEffects: true,
});

export default watchForExtensionsInjectable;
