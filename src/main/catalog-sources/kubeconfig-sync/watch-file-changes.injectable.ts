/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { type IComputedValue, ObservableMap, computed, observable } from "mobx";
import { inspect } from "util";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import { type Disposer, iter, bind, getOrInsert } from "../../../renderer/utils";
import type fs from "fs";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { FSWatcher, WatchOptions } from "chokidar";
import type { LensLogger } from "../../../common/logger";
import globToRegExp from "glob-to-regexp";
import path from "path";
import type { DiffChangedConfigArgs } from "./diff-changed-config.injectable";
import diffChangedConfigInjectable from "./diff-changed-config.injectable";
import fsInjectable from "../../../common/fs/fs.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import watchFilePathInjectable from "../../../common/fs/watch-file-path.injectable";

/**
 * This is the list of globs of which files are ignored when under a folder sync
 */
const ignoreGlobs = [
  "*.lock", // kubectl lock files
  "*.swp", // vim swap files
  ".DS_Store", // macOS specific
].map(rawGlob => ({
  rawGlob,
  matcher: globToRegExp(rawGlob),
}));

/**
 * This should be much larger than any kubeconfig text file
 *
 * Even if you have a cert-file, key-file, and client-cert files that is only
 * 12kb of extra data (at 4096 bytes each) which allows for around 150 entries.
 */
const folderSyncMaxAllowedFileReadSize = 2 * 1024 * 1024; // 2 MiB
const fileSyncMaxAllowedFileReadSize = 16 * folderSyncMaxAllowedFileReadSize; // 32 MiB

export interface WatchFileChangesDependencies {
  fsStat: (filePath: string) => Promise<fs.Stats>;
  watchFilePath: (filePath: string, options?: WatchOptions) => FSWatcher;
  diffChangedConfig: (args: DiffChangedConfigArgs) => Disposer;
  readonly logger: LensLogger;
}

// Exported for testing
function watchFileChanges(deps: WatchFileChangesDependencies, filePath: string): [IComputedValue<CatalogEntity[]>, Disposer] {
  const { fsStat, watchFilePath, logger, diffChangedConfig } = deps;
  const rootSource = new ObservableMap<string, ObservableMap<string, [Cluster, CatalogEntity]>>();
  const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));

  let watcher: FSWatcher;

  (async () => {
    try {
      const stat = await fsStat(filePath);
      const isFolderSync = stat.isDirectory();
      const cleanupFns = new Map<string, Disposer>();
      const maxAllowedFileReadSize = isFolderSync
        ? folderSyncMaxAllowedFileReadSize
        : fileSyncMaxAllowedFileReadSize;

      watcher = watchFilePath(filePath, {
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
            source: getOrInsert(rootSource, childFilePath, observable.map()),
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
            source: getOrInsert(rootSource, childFilePath, observable.map()),
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

  return [derivedSource, () => {
    watcher?.close();
  }];
}

const watchFileChangesInjectable = getInjectable({
  instantiate: (di) => bind(watchFileChanges, null, {
    diffChangedConfig: di.inject(diffChangedConfigInjectable),
    fsStat: di.inject(fsInjectable).stat,
    logger: di.inject(kubeconfigSyncLoggerInjectable),
    watchFilePath: di.inject(watchFilePathInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default watchFileChangesInjectable;

