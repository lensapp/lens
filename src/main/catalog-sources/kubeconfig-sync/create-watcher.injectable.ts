/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Stats } from "fs";
import watchInjectable from "../../../common/fs/watch.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface CreateKubeSyncWatcherOptions {
  isDirectorySync: boolean;
  onChange: (filePath: string, stats: Stats) => void;
  onAdd: (filePath: string, stats: Stats) => void;
  onRemove: (filePath: string) => void;
  onError: (error: Error) => void;
}

export interface KubeSyncWatcher {
  stop: () => void;
}

export type CreateKubeSyncWatcher = (filePath: string, opts: CreateKubeSyncWatcherOptions) => KubeSyncWatcher;

const createKubeSyncWatcherInjectable = getInjectable({
  id: "create-kube-sync-watcher",
  instantiate: (di): CreateKubeSyncWatcher => {
    const watch = di.inject(watchInjectable);
    const logger = di.inject(loggerInjectable);

    return (filePath, { isDirectorySync, ...handlers }) => {
      const watcher = watch<true>(filePath, {
        followSymlinks: true,
        depth: isDirectorySync ? 0 : 1, // DIRs works with 0 but files need 1 (bug: https://github.com/paulmillr/chokidar/issues/1095)
        disableGlobbing: true,
        ignorePermissionErrors: true,
        usePolling: false,
        awaitWriteFinish: {
          pollInterval: 100,
          stabilityThreshold: 1000,
        },
        atomic: 150, // for "atomic writes"
        alwaysStat: true,
      });

      watcher
        .on("change", handlers.onChange)
        .on("add", handlers.onAdd)
        .on("unlink", handlers.onRemove)
        .on("error", handlers.onError);

      return {
        stop: () => {
          void (async () => {
            try {
              await watcher.close();
            } catch (error) {
              logger.warn(`[KUBE-SYNC-WATCHER]: failed to stop watching "${filePath}": ${error}`);
            }
          })();
        },
      };
    };
  },
});

export default createKubeSyncWatcherInjectable;
