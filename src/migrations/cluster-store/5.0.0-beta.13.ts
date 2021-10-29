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

import type { ClusterModel, ClusterPreferences, ClusterPrometheusPreferences } from "../../common/cluster-types";
import { MigrationDeclaration, migrationLog } from "../helpers";
import { generateNewIdFor } from "../utils";
import path from "path";
import { moveSync, removeSync } from "fs-extra";
import { AppPaths } from "../../common/app-paths";

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

function moveStorageFolder({ folder, newId, oldId }: { folder: string, newId: string, oldId: string }): void {
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
    const folder = path.resolve(AppPaths.get("userData"), "lens-local-storage");

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
