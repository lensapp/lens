/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import statInjectable from "../../../../../../common/fs/stat.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export interface SyncKind {
  type: "file" | "folder" | "unknown";
}

export type DiscoverKubeconfigSyncKind = (path: string) => Promise<[string, SyncKind]>;

const discoverKubeconfigSyncKindInjectable = getInjectable({
  id: "discover-kubeconfig-sync-kind",
  instantiate: (di): DiscoverKubeconfigSyncKind => {
    const stat = di.inject(statInjectable);
    const logger = di.inject(loggerInjectionToken);

    return async (path) => {
      try {
        // stat follows the stat(2) linux syscall spec, namely it follows symlinks
        const stats = await stat(path);

        if (stats.isFile()) {
          return [path, { type: "file" }];
        }

        if (stats.isDirectory()) {
          return [path, { type: "folder" }];
        }

        logger.warn("[KUBECONFIG-SYNCS]: unknown stat entry", { stats });

        return [path, { type: "unknown" }];
      } catch (error) {
        logger.warn(`[KUBECONFIG-SYNCS]: failed to stat entry: ${error}`, { error });

        return [path, { type: "unknown" }];
      }
    };
  },
});

export default discoverKubeconfigSyncKindInjectable;
