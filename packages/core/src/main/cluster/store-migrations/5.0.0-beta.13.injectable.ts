/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterModel, ClusterPreferences, ClusterPrometheusPreferences } from "../../../common/cluster-types";
import { moveSync, removeSync } from "fs-extra";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { isDefined } from "@k8slens/utilities";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { clusterStoreMigrationInjectionToken } from "../../../features/cluster/storage/common/migration-token";
import { generateNewIdFor } from "../../../common/utils/generate-new-id-for";

interface Pre500ClusterModel extends ClusterModel {
  workspace?: string;
  workspaces?: string[];
}

function mergePrometheusPreferences(left: ClusterPrometheusPreferences, right: ClusterPrometheusPreferences): ClusterPrometheusPreferences {
  if (left.prometheus && left.prometheusProvider) {
    return {
      prometheus: left.prometheus,
      prometheusProvider: left.prometheusProvider,
    };
  }

  if (right.prometheus && right.prometheusProvider) {
    return {
      prometheus: right.prometheus,
      prometheusProvider: right.prometheusProvider,
    };
  }

  return {};
}

const mergePreferences = (left: ClusterPreferences, right: ClusterPreferences): ClusterPreferences => ({
  terminalCWD: left.terminalCWD || right.terminalCWD || undefined,
  clusterName: left.clusterName || right.clusterName || undefined,
  iconOrder: left.iconOrder || right.iconOrder || undefined,
  icon: left.icon || right.icon || undefined,
  httpsProxy: left.httpsProxy || right.httpsProxy || undefined,
  hiddenMetrics: mergeSet(left.hiddenMetrics ?? [], right.hiddenMetrics ?? []),
  ...mergePrometheusPreferences(left, right),
});

function mergeSet(...iterables: Iterable<string | undefined>[]): string[] {
  const res = new Set<string>();

  for (const iterable of iterables) {
    for (const val of iterable) {
      if (val) {
        res.add(val);
      }
    }
  }

  return [...res];
}

const mergeClusterModel = (prev: Pre500ClusterModel, right: Omit<Pre500ClusterModel, "id">): Pre500ClusterModel => ({
  id: prev.id,
  kubeConfigPath: prev.kubeConfigPath,
  contextName: prev.contextName,
  preferences: mergePreferences(prev.preferences ?? {}, right.preferences ?? {}),
  metadata: prev.metadata,
  labels: { ...(right.labels ?? {}), ...(prev.labels ?? {}) },
  accessibleNamespaces: mergeSet(prev.accessibleNamespaces ?? [], right.accessibleNamespaces ?? []),
  workspace: prev.workspace || right.workspace,
  workspaces: mergeSet([prev.workspace, right.workspace], prev.workspaces ?? [], right.workspaces ?? []),
});

const v500Beta13ClusterStoreMigrationInjectable = getInjectable({
  id: "v5.0.0-beta.13-cluster-store-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const logger = di.inject(loggerInjectionToken);

    const moveStorageFolder = ({ folder, newId, oldId }: { folder: string; newId: string; oldId: string }): void => {
      const oldPath = joinPaths(folder, `${oldId}.json`);
      const newPath = joinPaths(folder, `${newId}.json`);

      try {
        moveSync(oldPath, newPath);
      } catch (error) {
        if (String(error).includes("dest already exists")) {
          logger.info(`Multiple old lens-local-storage files for newId=${newId}. Removing ${oldId}.json`);
          removeSync(oldPath);
        }
      }
    };

    return {
      version: "5.0.0-beta.13",
      run(store) {
        const folder = joinPaths(userDataPath, "lens-local-storage");
        const oldClusters = (store.get("clusters") ?? []) as Pre500ClusterModel[];
        const clusters = new Map<string, Pre500ClusterModel>();

        for (const { id: oldId, ...cluster } of oldClusters) {
          const newId = generateNewIdFor(cluster);
          const newCluster = clusters.get(newId);

          if (newCluster) {
            logger.info(`Duplicate entries for ${newId}`, { oldId });
            clusters.set(newId, mergeClusterModel(newCluster, cluster));
          } else {
            logger.info(`First entry for ${newId}`, { oldId });
            clusters.set(newId, {
              ...cluster,
              id: newId,
              workspaces: [cluster.workspace].filter(isDefined),
            });
            moveStorageFolder({ folder, newId, oldId });
          }
        }

        store.set("clusters", [...clusters.values()]);
      },
    };
  },
  injectionToken: clusterStoreMigrationInjectionToken,
});

export default v500Beta13ClusterStoreMigrationInjectable;
