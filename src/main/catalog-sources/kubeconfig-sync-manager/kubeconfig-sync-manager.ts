/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue, ObservableMap } from "mobx";
import { action, observable, computed, runInAction, makeObservable, observe } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import { catalogEntityRegistry } from "../../catalog";
import type { FSWatcher } from "chokidar";
import { watch } from "chokidar";
import type { Stats } from "fs";
import fs from "fs";
import path from "path";
import type stream from "stream";
import type { Disposer } from "../../../common/utils";
import { bytesToUnits, getOrInsertWith, iter, noop } from "../../../common/utils";
import logger from "../../logger";
import type { KubeConfig } from "@kubernetes/client-node";
import { loadConfigFromString, splitConfig } from "../../../common/kube-helpers";
import { catalogEntityFromCluster, ClusterManager } from "../../cluster-manager";
import { UserStore } from "../../../common/user-store";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import { createHash } from "crypto";
import { homedir } from "os";
import globToRegExp from "glob-to-regexp";
import { inspect } from "util";
import type { ClusterModel, UpdateClusterModel } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";

const logPrefix = "[KUBECONFIG-SYNC]:";

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

interface Dependencies {
  directoryForKubeConfigs: string;
  createCluster: (model: ClusterModel) => Cluster;
}

const kubeConfigSyncName = "lens:kube-sync";

export class KubeconfigSyncManager {
  protected sources = observable.map<string, [IComputedValue<CatalogEntity[]>, Disposer]>();
  protected syncing = false;
  protected syncListDisposer?: Disposer;

  constructor(private dependencies: Dependencies) {
    makeObservable(this);
  }

  @action
  startSync(): void {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    logger.info(`${logPrefix} starting requested syncs`);

    catalogEntityRegistry.addComputedSource(kubeConfigSyncName, computed(() => (
      Array.from(iter.flatMap(
        this.sources.values(),
        ([entities]) => entities.get(),
      ))
    )));

    // This must be done so that c&p-ed clusters are visible
    this.startNewSync(this.dependencies.directoryForKubeConfigs);

    for (const filePath of UserStore.getInstance().syncKubeconfigEntries.keys()) {
      this.startNewSync(filePath);
    }

    this.syncListDisposer = observe(UserStore.getInstance().syncKubeconfigEntries, change => {
      switch (change.type) {
        case "add":
          this.startNewSync(change.name);
          break;
        case "delete":
          this.stopOldSync(change.name);
          break;
      }
    });
  }

  @action
  stopSync() {
    this.syncListDisposer?.();

    for (const filePath of this.sources.keys()) {
      this.stopOldSync(filePath);
    }

    catalogEntityRegistry.removeSource(kubeConfigSyncName);
    this.syncing = false;
  }

  @action
  protected startNewSync(filePath: string): void {
    if (this.sources.has(filePath)) {
      // don't start a new sync if we already have one
      return void logger.debug(`${logPrefix} already syncing file/folder`, { filePath });
    }

    this.sources.set(
      filePath,
      watchFileChanges(filePath, this.dependencies),
    );

    logger.info(`${logPrefix} starting sync of file/folder`, { filePath });
    logger.debug(`${logPrefix} ${this.sources.size} files/folders watched`, { files: Array.from(this.sources.keys()) });
  }

  @action
  protected stopOldSync(filePath: string): void {
    if (!this.sources.delete(filePath)) {
      // already stopped
      return void logger.debug(`${logPrefix} no syncing file/folder to stop`, { filePath });
    }

    logger.info(`${logPrefix} stopping sync of file/folder`, { filePath });
    logger.debug(`${logPrefix} ${this.sources.size} files/folders watched`, { files: Array.from(this.sources.keys()) });
  }
}

// exported for testing
export function configToModels(rootConfig: KubeConfig, filePath: string): UpdateClusterModel[] {
  const validConfigs = [];

  for (const { config, error } of splitConfig(rootConfig)) {
    if (error) {
      logger.debug(`${logPrefix} context failed validation: ${error}`, { context: config.currentContext, filePath });
    } else {
      validConfigs.push({
        kubeConfigPath: filePath,
        contextName: config.currentContext,
      });
    }
  }

  return validConfigs;
}

type RootSourceValue = [Cluster, CatalogEntity];
type RootSource = ObservableMap<string, RootSourceValue>;

// exported for testing
export const computeDiff = ({ directoryForKubeConfigs, createCluster }: Dependencies) => (contents: string, source: RootSource, filePath: string): void => {
  runInAction(() => {
    try {
      const { config, error } = loadConfigFromString(contents);

      if (error) {
        logger.warn(`${logPrefix} encountered errors while loading config: ${error.message}`, { filePath, details: error.details });
      }

      const rawModels = configToModels(config, filePath);
      const models = new Map(rawModels.map(m => [m.contextName, m]));

      logger.debug(`${logPrefix} File now has ${models.size} entries`, { filePath });

      for (const [contextName, value] of source) {
        const model = models.get(contextName);

        // remove and disconnect clusters that were removed from the config
        if (!model) {
          // remove from the deleting set, so that if a new context of the same name is added, it isn't marked as deleting
          ClusterManager.getInstance().deleting.delete(value[0].id);

          value[0].disconnect();
          source.delete(contextName);
          logger.debug(`${logPrefix} Removed old cluster from sync`, { filePath, contextName });
          continue;
        }

        // TODO: For the update check we need to make sure that the config itself hasn't changed.
        // Probably should make it so that cluster keeps a copy of the config in its memory and
        // diff against that

        // or update the model and mark it as not needed to be added
        value[0].updateModel(model);
        models.delete(contextName);
        logger.debug(`${logPrefix} Updated old cluster from sync`, { filePath, contextName });
      }

      for (const [contextName, model] of models) {
        // add new clusters to the source
        try {
          const clusterId = createHash("md5").update(`${filePath}:${contextName}`).digest("hex");

          const cluster = ClusterStore.getInstance().getById(clusterId) || createCluster({ ...model, id: clusterId });

          if (!cluster.apiUrl) {
            throw new Error("Cluster constructor failed, see above error");
          }

          const entity = catalogEntityFromCluster(cluster);

          if (!filePath.startsWith(directoryForKubeConfigs)) {
            entity.metadata.labels.file = filePath.replace(homedir(), "~");
          }
          source.set(contextName, [cluster, entity]);

          logger.debug(`${logPrefix} Added new cluster from sync`, { filePath, contextName });
        } catch (error) {
          logger.warn(`${logPrefix} Failed to create cluster from model: ${error}`, { filePath, contextName });
        }
      }
    } catch (error) {
      logger.warn(`${logPrefix} Failed to compute diff: ${error}`, { filePath });
      source.clear(); // clear source if we have failed so as to not show outdated information
    }
  });
};

interface DiffChangedConfigArgs {
  filePath: string;
  source: RootSource;
  stats: fs.Stats;
  maxAllowedFileReadSize: number;
}

const diffChangedConfigFor = (dependencies: Dependencies) => ({ filePath, source, stats, maxAllowedFileReadSize }: DiffChangedConfigArgs): Disposer => {
  logger.debug(`${logPrefix} file changed`, { filePath });

  if (stats.size >= maxAllowedFileReadSize) {
    logger.warn(`${logPrefix} skipping ${filePath}: size=${bytesToUnits(stats.size)} is larger than maxSize=${bytesToUnits(maxAllowedFileReadSize)}`);
    source.clear();

    return noop;
  }

  // TODO: replace with an AbortController with fs.readFile when we upgrade to Node 16 (after it comes out)
  const fileReader = fs.createReadStream(filePath, {
    mode: fs.constants.O_RDONLY,
  });
  const readStream: stream.Readable = fileReader;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let fileString = "";
  let closed = false;

  const cleanup = () => {
    closed = true;
    fileReader.close(); // This may not close the stream.
    // Artificially marking end-of-stream, as if the underlying resource had
    // indicated end-of-file by itself, allows the stream to close.
    // This does not cancel pending read operations, and if there is such an
    // operation, the process may still not be able to exit successfully
    // until it finishes.
    fileReader.push(null);
    fileReader.read(0);
    readStream.removeAllListeners();
  };

  readStream
    .on("data", (chunk: Buffer) => {
      try {
        fileString += decoder.decode(chunk, { stream: true });
      } catch (error) {
        logger.warn(`${logPrefix} skipping ${filePath}: ${error}`);
        source.clear();
        cleanup();
      }
    })
    .on("close", () => cleanup())
    .on("error", error => {
      cleanup();
      logger.warn(`${logPrefix} failed to read file: ${error}`, { filePath });
    })
    .on("end", () => {
      if (!closed) {
        computeDiff(dependencies)(fileString, source, filePath);
      }
    });

  return cleanup;
};

const watchFileChanges = (filePath: string, dependencies: Dependencies): [IComputedValue<CatalogEntity[]>, Disposer] => {
  const rootSource = observable.map<string, ObservableMap<string, RootSourceValue>>();
  const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));

  let watcher: FSWatcher;

  (async () => {
    try {
      const stat = await fs.promises.stat(filePath);
      const isFolderSync = stat.isDirectory();
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
        alwaysStat: true,
      });

      const diffChangedConfig = diffChangedConfigFor(dependencies);

      watcher
        .on("change", (childFilePath, stats: Stats): void => {
          const cleanup = cleanupFns.get(childFilePath);

          if (!cleanup) {
            // file was previously ignored, do nothing
            return void logger.debug(`${logPrefix} ${inspect(childFilePath)} that should have been previously ignored has changed. Doing nothing`);
          }

          cleanup();
          cleanupFns.set(childFilePath, diffChangedConfig({
            filePath: childFilePath,
            source: getOrInsertWith(rootSource, childFilePath, observable.map),
            stats,
            maxAllowedFileReadSize,
          }));
        })
        .on("add", (childFilePath, stats: Stats): void => {
          if (isFolderSync) {
            const fileName = path.basename(childFilePath);

            for (const ignoreGlob of ignoreGlobs) {
              if (ignoreGlob.matcher.test(fileName)) {
                return void logger.info(`${logPrefix} ignoring ${inspect(childFilePath)} due to ignore glob: ${ignoreGlob.rawGlob}`);
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
        .on("error", error => logger.error(`${logPrefix} watching file/folder failed: ${error}`, { filePath }));
    } catch (error) {
      console.log((error as { stack: unknown }).stack);
      logger.warn(`${logPrefix} failed to start watching changes: ${error}`);
    }
  })();

  return [derivedSource, () => {
    watcher?.close();
  }];
};
