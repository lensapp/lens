/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import GlobToRegExp from "glob-to-regexp";
import type { IComputedValue, ObservableMap } from "mobx";
import { computed, observable } from "mobx";
import path from "path";
import { inspect } from "util";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import statInjectable from "../../../common/fs/stat.injectable";
import type { KubeSyncWatcher } from "./create-watcher.injectable";
import createKubeSyncWatcherInjectable from "./create-watcher.injectable";
import type { Disposer } from "../../../common/utils";
import { getOrInsertWith, iter } from "../../../common/utils";
import diffChangedKubeconfigInjectable from "./diff-changed-kubeconfig.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

export type WatchKubeconfigFileChanges = (filepath: string) => [IComputedValue<CatalogEntity[]>, Disposer];

/**
 * This is the list of globs of which files are ignored when under a folder sync
 */
const ignoreGlobs = [
  "*.lock", // kubectl lock files
  "*.swp", // vim swap files
  ".DS_Store", // macOS specific
].map(rawGlob => ({
  rawGlob,
  matcher: GlobToRegExp(rawGlob),
}));

/**
 * This should be much larger than any kubeconfig text file
 *
 * Even if you have a cert-file, key-file, and client-cert files that is only
 * 12kb of extra data (at 4096 bytes each) which allows for around 150 entries.
 */
const dirSyncMaxAllowedFileReadSize = 2 * 1024 * 1024; // 2 MiB
const fileSyncMaxAllowedFileReadSize = 16 * dirSyncMaxAllowedFileReadSize; // 32 MiB

const watchKubeconfigFileChangesInjectable = getInjectable({
  id: "watch-kubeconfig-file-changes",
  instantiate: (di): WatchKubeconfigFileChanges => {
    const diffChangedKubeconfig = di.inject(diffChangedKubeconfigInjectable);
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const stat = di.inject(statInjectable);
    const createKubeSyncWatcher = di.inject(createKubeSyncWatcherInjectable);

    return (filePath) => {
      const rootSource = observable.map<string, ObservableMap<string, [Cluster, CatalogEntity]>>();
      const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));

      let watcher: KubeSyncWatcher;

      (async () => {
        try {
          const stats = await stat(filePath);
          const isDirectorySync = stats.isDirectory();
          const cleanupFns = new Map<string, Disposer>();
          const maxAllowedFileReadSize = isDirectorySync
            ? dirSyncMaxAllowedFileReadSize
            : fileSyncMaxAllowedFileReadSize;

          watcher = createKubeSyncWatcher(filePath, {
            isDirectorySync,
            onChange: (childFilePath, stats): void => {
              console.log("change", childFilePath);
              const cleanup = cleanupFns.get(childFilePath);

              if (!cleanup) {
                // file was previously ignored, do nothing
                return void logger.debug(`${inspect(childFilePath)} that should have been previously ignored has changed. Doing nothing`);
              }

              cleanup();
              cleanupFns.set(childFilePath, diffChangedKubeconfig({
                filePath: childFilePath,
                source: getOrInsertWith(rootSource, childFilePath, observable.map),
                stats,
                maxAllowedFileReadSize,
              }));
            },
            onAdd: (childFilePath, stats): void => {
              console.log("add", childFilePath);

              if (isDirectorySync) {
                const fileName = path.basename(childFilePath);

                for (const ignoreGlob of ignoreGlobs) {
                  if (ignoreGlob.matcher.test(fileName)) {
                    return void logger.info(`ignoring ${inspect(childFilePath)} due to ignore glob: ${ignoreGlob.rawGlob}`);
                  }
                }
              }

              cleanupFns.set(childFilePath, diffChangedKubeconfig({
                filePath: childFilePath,
                source: getOrInsertWith(rootSource, childFilePath, observable.map),
                stats,
                maxAllowedFileReadSize,
              }));
            },
            onRemove: (childFilePath) => {
              cleanupFns.get(childFilePath)?.();
              cleanupFns.delete(childFilePath);
              rootSource.delete(childFilePath);
            },
            onError: (error) => {
              console.log("error", error);
              logger.error(`watching file/folder failed: ${error}`, { filePath });
            },
          });
        } catch (error) {
          logger.warn(`failed to start watching changes: ${error}`);
        }
      })();

      return [derivedSource, () => {
        watcher?.stop();
      }];
    };
  },
});

export default watchKubeconfigFileChangesInjectable;
