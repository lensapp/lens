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
import type { Watcher } from "../../../common/fs/watch/watch.injectable";
import watchInjectable from "../../../common/fs/watch/watch.injectable";
import type { Disposer } from "@k8slens/utilities";
import { getOrInsertWith, iter } from "@k8slens/utilities";
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
const folderSyncMaxAllowedFileReadSize = 2 * 1024 * 1024; // 2 MiB
const fileSyncMaxAllowedFileReadSize = 16 * folderSyncMaxAllowedFileReadSize; // 32 MiB

const watchKubeconfigFileChangesInjectable = getInjectable({
  id: "watch-kubeconfig-file-changes",
  instantiate: (di): WatchKubeconfigFileChanges => {
    const diffChangedKubeconfig = di.inject(diffChangedKubeconfigInjectable);
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const stat = di.inject(statInjectable);
    const watch = di.inject(watchInjectable);

    return (filePath) => {
      const rootSource = observable.map<string, ObservableMap<string, [Cluster, CatalogEntity]>>();
      const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));

      let watcher: Watcher<true>;

      (async () => {
        try {
          const stats = await stat(filePath);
          const isFolderSync = stats.isDirectory();
          const cleanupFns = new Map<string, Disposer>();
          const maxAllowedFileReadSize = isFolderSync
            ? folderSyncMaxAllowedFileReadSize
            : fileSyncMaxAllowedFileReadSize;

          watcher = watch<true>(filePath, {
            followSymlinks: true,
            depth: isFolderSync ? 0 : 1, // DIRs works with 0 but files need 1 (bug: https://github.com/paulmillr/chokidar/issues/1095)
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
            .on("change", (childFilePath, stats): void => {
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
            })
            .on("add", (childFilePath, stats): void => {
              if (isFolderSync) {
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
            })
            .on("unlink", (childFilePath) => {
              cleanupFns.get(childFilePath)?.();
              cleanupFns.delete(childFilePath);
              rootSource.delete(childFilePath);
            })
            .on("error", error => logger.error(`watching file/folder failed: ${error}`, { filePath }));
        } catch (error) {
          logger.warn(`failed to start watching changes: ${error}`);
        }
      })();

      return [derivedSource, () => {
        watcher?.close();
      }];
    };
  },
});

export default watchKubeconfigFileChangesInjectable;
