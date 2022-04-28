/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Cluster } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { FSWatcher } from "chokidar";
import { watch } from "chokidar";
import GlobToRegExp from "glob-to-regexp";
import type { IComputedValue, ObservableMap } from "mobx";
import { computed, observable } from "mobx";
import path from "path";
import { inspect } from "util";
import type { CatalogEntity } from "../../../common/catalog";
import fsInjectable from "../../../common/fs/fs.injectable";
import { iter, type Disposer, getOrInsertWith } from "../../../common/utils";
import diffChangedConfigInjectable from "./diff-changed-config.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

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

export interface ChangesResult {
  stopWatching: () => void;
  source: IComputedValue<CatalogEntity[]>;
}

export type WatchFileChanges = (filePath: string) => ChangesResult;

const watchFileChangesInjectable = getInjectable({
  id: "watch-file-changes",
  instantiate: (di): WatchFileChanges => {
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const { stat } = di.inject(fsInjectable);
    const diffChangedConfig = di.inject(diffChangedConfigInjectable);

    return (filePath) => {
      const rootSource = observable.map<string, ObservableMap<string, [Cluster, CatalogEntity]>>();
      const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));

      let watcher: FSWatcher;

      (async () => {
        try {
          const stats = await stat(filePath);
          const isFolderSync = stats.isDirectory();
          const cleanupFns = new Map<string, Disposer>();
          const maxAllowedFileReadSize = isFolderSync
            ? folderSyncMaxAllowedFileReadSize
            : fileSyncMaxAllowedFileReadSize;

          watcher = watch(filePath, {
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
          });

          watcher
            .on("change", (childFilePath, stats) => {
              const cleanup = cleanupFns.get(childFilePath);

              if (!cleanup) {
                // file was previously ignored, do nothing
                return void logger.debug(`${inspect(childFilePath)} that should have been previously ignored has changed. Doing nothing`);
              }

              cleanup();
              cleanupFns.set(childFilePath, diffChangedConfig({
                filePath: childFilePath,
                source: getOrInsertWith(rootSource, childFilePath, observable.map),
                stats,
                maxAllowedFileReadSize,
              }));
            })
            .on("add", (childFilePath, stats) => {
              if (isFolderSync) {
                const fileName = path.basename(childFilePath);

                for (const ignoreGlob of ignoreGlobs) {
                  if (ignoreGlob.matcher.test(fileName)) {
                    return void logger.info(`ignoring ${inspect(childFilePath)} due to ignore glob: ${ignoreGlob.rawGlob}`);
                  }
                }
              }

              cleanupFns.set(childFilePath, diffChangedConfig({
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
          console.log(error.stack);
          logger.warn(`failed to start watching changes: ${error}`);
        }
      })();

      return {
        source: derivedSource,
        stopWatching: () => {
          watcher?.close();
        },
      };
    };
  },
});

export default watchFileChangesInjectable;
