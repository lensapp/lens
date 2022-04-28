/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterModel, ClusterPreferences, ClusterPrometheusPreferences } from "../../common/cluster/types";
import type { MigrationDeclaration } from "../helpers";
import { migrationLog } from "../helpers";
import { generateNewIdFor } from "../utils";
import path from "path";
import { moveSync, removeSync } from "fs-extra";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import directoryForUserDataInjectable
  from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

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

function mergePreferences(left: ClusterPreferences, right: ClusterPreferences): ClusterPreferences {
  return {
    terminalCWD: left.terminalCWD || right.terminalCWD || undefined,
    clusterName: left.clusterName || right.clusterName || undefined,
    iconOrder: left.iconOrder || right.iconOrder || undefined,
    icon: left.icon || right.icon || undefined,
    httpsProxy: left.httpsProxy || right.httpsProxy || undefined,
    hiddenMetrics: mergeSet(left.hiddenMetrics ?? [], right.hiddenMetrics ?? []),
    ...mergePrometheusPreferences(left, right),
  };
}

function mergeLabels(left: Record<string, string>, right: Record<string, string>): Record<string, string> {
  return {
    ...right,
    ...left,
  };
}

function mergeSet(...iterables: Iterable<string>[]): string[] {
  const res = new Set<string>();

  for (const iterable of iterables) {
    for (const val of iterable) {
      res.add(val);
    }
  }

  return [...res];
}

function mergeClusterModel(prev: ClusterModel, right: Omit<ClusterModel, "id">): ClusterModel {
  return {
    id: prev.id,
    kubeConfigPath: prev.kubeConfigPath,
    contextName: prev.contextName,
    preferences: mergePreferences(prev.preferences ?? {}, right.preferences ?? {}),
    metadata: prev.metadata,
    labels: mergeLabels(prev.labels ?? {}, right.labels ?? {}),
    accessibleNamespaces: mergeSet(prev.accessibleNamespaces ?? [], right.accessibleNamespaces ?? []),
    workspace: prev.workspace || right.workspace,
    workspaces: mergeSet([prev.workspace, right.workspace], prev.workspaces ?? [], right.workspaces ?? []),
  };
}

function moveStorageFolder({ folder, newId, oldId }: { folder: string; newId: string; oldId: string }): void {
  const oldPath = path.resolve(folder, `${oldId}.json`);
  const newPath = path.resolve(folder, `${newId}.json`);

  try {
    moveSync(oldPath, newPath);
  } catch (error) {
    if (String(error).includes("dest already exists")) {
      migrationLog(`Multiple old lens-local-storage files for newId=${newId}. Removing ${oldId}.json`);
      removeSync(oldPath);
    }
  }
}

export default {
  version: "5.0.0-beta.13",
  run(store) {
    const di = getLegacyGlobalDiForExtensionApi();

    const userDataPath = di.inject(directoryForUserDataInjectable);

    const folder = path.resolve(userDataPath, "lens-local-storage");

    const oldClusters: ClusterModel[] = store.get("clusters") ?? [];
    const clusters = new Map<string, ClusterModel>();

    for (const { id: oldId, ...cluster } of oldClusters) {
      const newId = generateNewIdFor(cluster);

      if (clusters.has(newId)) {
        migrationLog(`Duplicate entries for ${newId}`, { oldId });
        clusters.set(newId, mergeClusterModel(clusters.get(newId), cluster));
      } else {
        migrationLog(`First entry for ${newId}`, { oldId });
        clusters.set(newId, {
          ...cluster,
          id: newId,
          workspaces: [cluster.workspace].filter(Boolean),
        });
        moveStorageFolder({ folder, newId, oldId });
      }
    }

    store.set("clusters", [...clusters.values()]);
  },
} as MigrationDeclaration;
