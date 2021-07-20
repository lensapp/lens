/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, observable, IComputedValue, computed, ObservableMap, runInAction, makeObservable, observe } from "mobx";
import type { CatalogEntity } from "../../common/catalog";
import { catalogEntityRegistry } from "../../main/catalog";
import { watch } from "chokidar";
import fs from "fs";
import fse from "fs-extra";
import type stream from "stream";
import { Disposer, ExtendedObservableMap, iter, Singleton } from "../../common/utils";
import logger from "../logger";
import type { KubeConfig } from "@kubernetes/client-node";
import { loadConfigFromString, splitConfig } from "../../common/kube-helpers";
import { Cluster } from "../cluster";
import { catalogEntityFromCluster, ClusterManager } from "../cluster-manager";
import { UserStore } from "../../common/user-store";
import { ClusterStore, UpdateClusterModel } from "../../common/cluster-store";
import { createHash } from "crypto";
import { homedir } from "os";

const logPrefix = "[KUBECONFIG-SYNC]:";

export class KubeconfigSyncManager extends Singleton {
  protected sources = observable.map<string, [IComputedValue<CatalogEntity[]>, Disposer]>();
  protected syncing = false;
  protected syncListDisposer?: Disposer;

  protected static readonly syncName = "lens:kube-sync";

  constructor() {
    super();

    makeObservable(this);
  }

  @action
  startSync(): void {
    if (this.syncing) {
      return;
    }

    this.syncing = true;

    logger.info(`${logPrefix} starting requested syncs`);

    catalogEntityRegistry.addComputedSource(KubeconfigSyncManager.syncName, computed(() => (
      Array.from(iter.flatMap(
        this.sources.values(),
        ([entities]) => entities.get()
      ))
    )));

    // This must be done so that c&p-ed clusters are visible
    this.startNewSync(ClusterStore.storedKubeConfigFolder);

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

    catalogEntityRegistry.removeSource(KubeconfigSyncManager.syncName);
    this.syncing = false;
  }

  @action
  protected async startNewSync(filePath: string): Promise<void> {
    if (this.sources.has(filePath)) {
      // don't start a new sync if we already have one
      return void logger.debug(`${logPrefix} already syncing file/folder`, { filePath });
    }

    try {
      this.sources.set(filePath, await watchFileChanges(filePath));

      logger.info(`${logPrefix} starting sync of file/folder`, { filePath });
      logger.debug(`${logPrefix} ${this.sources.size} files/folders watched`, { files: Array.from(this.sources.keys()) });
    } catch (error) {
      logger.warn(`${logPrefix} failed to start watching changes: ${error}`);
    }
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
export function computeDiff(contents: string, source: RootSource, filePath: string): void {
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
          const cluster = ClusterStore.getInstance().getById(clusterId) || new Cluster({ ...model, id: clusterId});

          if (!cluster.apiUrl) {
            throw new Error("Cluster constructor failed, see above error");
          }

          const entity = catalogEntityFromCluster(cluster);

          if (!filePath.startsWith(ClusterStore.storedKubeConfigFolder)) {
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
}

function diffChangedConfig(filePath: string, source: RootSource): Disposer {
  logger.debug(`${logPrefix} file changed`, { filePath });

  // TODO: replace with an AbortController with fs.readFile when we upgrade to Node 16 (after it comes out)
  const fileReader = fs.createReadStream(filePath, {
    mode: fs.constants.O_RDONLY,
  });
  const readStream: stream.Readable = fileReader;
  const bufs: Buffer[] = [];
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
    .on("data", chunk => bufs.push(chunk))
    .on("close", () => cleanup())
    .on("error", error => {
      cleanup();
      logger.warn(`${logPrefix} failed to read file: ${error}`, { filePath });
    })
    .on("end", () => {
      if (!closed) {
        computeDiff(Buffer.concat(bufs).toString("utf-8"), source, filePath);
      }
    });

  return cleanup;
}

async function watchFileChanges(filePath: string): Promise<[IComputedValue<CatalogEntity[]>, Disposer]> {
  const stat = await fse.stat(filePath); // traverses symlinks, is a race condition
  const watcher = watch(filePath, {
    followSymlinks: true,
    depth: stat.isDirectory() ? 0 : 1, // DIRs works with 0 but files need 1 (bug: https://github.com/paulmillr/chokidar/issues/1095)
    disableGlobbing: true,
    ignorePermissionErrors: true,
    usePolling: false,
    awaitWriteFinish: {
      pollInterval: 100,
      stabilityThreshold: 1000,
    },
  });
  const rootSource = new ExtendedObservableMap<string, ObservableMap<string, RootSourceValue>>();
  const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));
  const stoppers = new Map<string, Disposer>();

  watcher
    .on("change", (childFilePath) => {
      stoppers.get(childFilePath)();
      stoppers.set(childFilePath, diffChangedConfig(childFilePath, rootSource.getOrInsert(childFilePath, observable.map)));
    })
    .on("add", (childFilePath) => {
      stoppers.set(childFilePath, diffChangedConfig(childFilePath, rootSource.getOrInsert(childFilePath, observable.map)));
    })
    .on("unlink", (childFilePath) => {
      stoppers.get(childFilePath)();
      stoppers.delete(childFilePath);
      rootSource.delete(childFilePath);
    })
    .on("error", error => logger.error(`${logPrefix} watching file/folder failed: ${error}`, { filePath }));

  return [derivedSource, () => watcher.close()];
}
