/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createHash } from "crypto";
import type { ObservableMap } from "mobx";
import { runInAction } from "mobx";
import { homedir } from "os";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import type { CatalogEntity } from "../../../common/catalog";
import type { Cluster } from "../../../common/cluster/cluster";
import getClusterByIdInjectable from "../../../common/cluster/get-by-id.injectable";
import { loadConfigFromString } from "../../../common/kube-helpers";
import { catalogEntityFromCluster } from "../../cluster/manager";
import clusterManagerInjectable from "../../cluster/manager.injectable";
import createClusterInjectable from "../../create-cluster/create-cluster.injectable";
import configToModelsInjectable from "./config-to-models.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";

export type ComputeDiff = (contents: string, source: ObservableMap<string, [Cluster, CatalogEntity]>, filePath: string) => void;

const computeDiffInjectable = getInjectable({
  id: "compute-diff",
  instantiate: (di): ComputeDiff => {
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const configToModels = di.inject(configToModelsInjectable);
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);
    const createCluster = di.inject(createClusterInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    return (contents, source, filePath) => {
      runInAction(() => {
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
              clusterManager.deleting.delete(value[0].id);

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
    };
  },
});

export default computeDiffInjectable;
