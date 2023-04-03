/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createHash } from "crypto";
import type { ObservableMap } from "mobx";
import { action } from "mobx";
import { homedir } from "os";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import type { CatalogEntity } from "../../../common/catalog";
import { Cluster } from "../../../common/cluster/cluster";
import { loadConfigFromString } from "../../../common/kube-helpers";
import clustersThatAreBeingDeletedInjectable from "../../cluster/are-being-deleted.injectable";
import { catalogEntityFromCluster } from "../../cluster/manager";
import configToModelsInjectable from "./config-to-models.injectable";
import kubeconfigSyncLoggerInjectable from "./logger.injectable";
import clusterConnectionInjectable from "../../cluster/cluster-connection.injectable";
import getClusterByIdInjectable from "../../../features/cluster/storage/common/get-by-id.injectable";

export type ComputeKubeconfigDiff = (contents: string, source: ObservableMap<string, [Cluster, CatalogEntity]>, filePath: string) => void;

const computeKubeconfigDiffInjectable = getInjectable({
  id: "compute-kubeconfig-diff",
  instantiate: (di): ComputeKubeconfigDiff => {
    const directoryForKubeConfigs = di.inject(directoryForKubeConfigsInjectable);
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);
    const configToModels = di.inject(configToModelsInjectable);
    const logger = di.inject(kubeconfigSyncLoggerInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    return action((contents, source, filePath) => {
      try {
        const { config, error } = loadConfigFromString(contents);

        if (error) {
          logger.warn(`encountered errors while loading config: ${error.message}`, { filePath, details: error.details });
        }

        const rawModels = configToModels(config, filePath);
        const models = new Map(rawModels.map((model) => [model.contextName, model]));

        logger.debug(`File now has ${models.size} entries`, { filePath });

        for (const [contextName, value] of source) {
          const model = models.get(contextName);

          // remove and disconnect clusters that were removed from the config
          if (!model) {
            // remove from the deleting set, so that if a new context of the same name is added, it isn't marked as deleting
            clustersThatAreBeingDeleted.delete(value[0].id);

            const clusterConnection = di.inject(clusterConnectionInjectable, value[0]);

            clusterConnection.disconnect();
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
            const cluster = getClusterById(clusterId) ?? new Cluster({ ...model, id: clusterId });
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
        logger.warn(`Failed to compute diff: ${error}`, { filePath });
        source.clear(); // clear source if we have failed so as to not show outdated information
      }

      logger.debug("Finished computing diff", { filePath });
    });
  },
});

export default computeKubeconfigDiffInjectable;
