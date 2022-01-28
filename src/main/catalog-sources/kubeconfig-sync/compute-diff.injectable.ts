/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeConfig } from "@kubernetes/client-node";
import { createHash } from "crypto";
import { action, ObservableMap } from "mobx";
import { homedir } from "os";
import type { CatalogEntity } from "../../../common/catalog";
import type { ClusterModel, UpdateClusterModel } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";
import { loadConfigFromString } from "../../../common/kube-helpers";
import type { LensLogger } from "../../../common/logger";
import { catalogEntityFromCluster } from "../../cluster-manager/cluster-manager";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../common/utils";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import configToModelsInjectable from "./config-to-models.injectable";
import createClusterInjectable from "../../create-cluster/create-cluster.injectable";
import getClusterByIdInjectable from "../../../common/cluster-store/get-cluster-by-id.injectable";
import removeFromDeletingInjectable from "../../cluster-manager/remove-from-deleting.injectable";

export interface ComputeDiffArguments {
  contents: string;
  source: ObservableMap<string, [Cluster, CatalogEntity]>;
  filePath: string;
}

export interface ComputeDiffDependencies {
  removeFromDeleting: (clusterId: string) => void;
  getClusterById: (clusterId: string) => Cluster;
  createCluster: (model: ClusterModel) => Cluster;
  directoryForKubeConfigs: string;
  logger: LensLogger;
  configToModels: (rootConfig: KubeConfig, filePath: string) => UpdateClusterModel[];
}

const computeDiff = action((deps: ComputeDiffDependencies, args: ComputeDiffArguments): void => {
  const { contents, source, filePath } = args;
  const { removeFromDeleting, getClusterById, createCluster, directoryForKubeConfigs, configToModels, logger } = deps;

  try {
    const { config, error } = loadConfigFromString(contents);

    if (error) {
      logger.warn(`encountered errors while loading config: ${error.message}`, { filePath, details: error.details });
    }

    const rawModels = configToModels(config, filePath);
    const models = new Map(rawModels.map(m => [m.contextName, m]));

    logger.debug(`File now has ${models.size} entries`, { filePath });

    for (const [contextName, value] of source) {
      const model = models.get(contextName);

      // remove and disconnect clusters that were removed from the config
      if (!model) {
        // remove from the deleting set, so that if a new context of the same name is added, it isn't marked as deleting
        removeFromDeleting(value[0].id);

        value[0].disconnect();
        source.delete(contextName);
        logger.debug(`Removed old cluster from sync`, { filePath, contextName });
        continue;
      }

      // TODO: For the update check we need to make sure that the config itself hasn't changed.
      // Probably should make it so that cluster keeps a copy of the config in its memory and
      // diff against that

      // or update the model and mark it as not needed to be added
      value[0].updateModel(model);
      models.delete(contextName);
      logger.debug(`Updated old cluster from sync`, { filePath, contextName });
    }

    for (const [contextName, model] of models) {
      // add new clusters to the source
      try {
        const clusterId = createHash("md5").update(`${filePath}:${contextName}`).digest("hex");

        const cluster = getClusterById(clusterId) || createCluster({ ...model, id: clusterId });

        if (!cluster.apiUrl) {
          throw new Error("Cluster constructor failed, see above error");
        }

        const entity = catalogEntityFromCluster(cluster);

        if (!filePath.startsWith(directoryForKubeConfigs)) {
          entity.metadata.labels.file = filePath.replace(homedir(), "~");
        }
        source.set(contextName, [cluster, entity]);

        logger.debug(`Added new cluster from sync`, { filePath, contextName });
      } catch (error) {
        logger.warn(`Failed to create cluster from model: ${error}`, { filePath, contextName });
      }
    }
  } catch (error) {
    console.log(error);
    logger.warn(`Failed to compute diff: ${error}`, { filePath });
    source.clear(); // clear source if we have failed so as to not show outdated information
  }
});

const computeDiffInjectable = getInjectable({
  instantiate: (di) => bind(computeDiff, null, {
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    logger: di.inject(kubeconfigSyncLoggerInjectable),
    configToModels: di.inject(configToModelsInjectable),
    createCluster: di.inject(createClusterInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    removeFromDeleting: di.inject(removeFromDeletingInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default computeDiffInjectable;

