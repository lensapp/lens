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
import { app } from "electron";
import { CatalogEntity, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import type { ActionContext, ContextMenu, MenuContext } from "../catalog/catalog-entity";
import * as clusterIpc from "../cluster-ipc";
import { ClusterStore } from "../cluster-store";
import { requestMain } from "../ipc";
import { storedKubeConfigFolder } from "../utils";
import { productName } from "../vars";


export type KubernetesClusterPrometheusMetrics = {
  address?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  type?: string;
};

export type KubernetesClusterSpec = {
  kubeconfigPath: string;
  kubeconfigContext: string;
  metrics?: {
    source: string;
    prometheus?: KubernetesClusterPrometheusMetrics;
  }
};

export interface KubernetesClusterStatus extends CatalogEntityStatus {
  phase?: "connected" | "disconnected";
}

export class KubernetesCluster extends CatalogEntity<CatalogEntityMetadata, KubernetesClusterStatus, KubernetesClusterSpec> {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "KubernetesCluster";

  async connect(): Promise<void> {
    if (app) {
      const cluster = ClusterStore.getInstance().getById(this.metadata.uid);

      if (!cluster) return;

      await cluster.activate();

      return;
    }

    await requestMain(clusterIpc.activate, this.metadata.uid, false);

    return;
  }

  async disconnect(): Promise<void> {
    if (app) {
      const cluster = ClusterStore.getInstance().getById(this.metadata.uid);

      if (!cluster) return;

      cluster.disconnect();

      return;
    }

    await requestMain(clusterIpc.disconnect, this.metadata.uid, false);

    return;
  }

  onRun = (context: ActionContext) => {
    context.navigate(`/cluster/${this.metadata.uid}`);
  };

  onContextMenuOpen = (context: MenuContext) => {
    const res: ContextMenu[] = [];

    if (this.status.phase == "connected") {
      res.push({
        icon: "link_off",
        title: "Disconnect",
        onClick: async () => {
          ClusterStore.getInstance().deactivate(this.metadata.uid);
          requestMain(clusterIpc.disconnect, this.metadata.uid);
        }
      });
    }

    res.push({
      icon: "settings",
      title: "Settings",
      onlyVisibleForSource: "local",
      onClick: async () => context.navigate(`/entity/${this.metadata.uid}/settings`)
    });

    if (this.metadata.labels["file"]?.startsWith(storedKubeConfigFolder())) {
      res.push({
        icon: "delete",
        title: "Delete",
        onlyVisibleForSource: "local",
        onClick: async () => ClusterStore.getInstance().removeById(this.metadata.uid),
        confirm: {
          message: `Remove Kubernetes Cluster "${this.metadata.name} from ${productName}?`
        }
      });
    }

    return res;
  };
}
