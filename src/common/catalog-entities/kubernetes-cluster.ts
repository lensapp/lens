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

import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";
import { CatalogEntity, CatalogEntityActionContext, CatalogEntityAddMenuContext, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog";
import { clusterActivateHandler, clusterDeleteHandler, clusterDisconnectHandler } from "../cluster-ipc";
import { ClusterStore } from "../cluster-store";
import { requestMain } from "../ipc";
import { CatalogCategory, CatalogCategorySpec } from "../catalog";
import { addClusterURL } from "../routes";
import { app } from "electron";
import { HotbarStore } from "../hotbar-store";

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
  iconData?: string;
  metrics?: {
    source: string;
    prometheus?: KubernetesClusterPrometheusMetrics;
  }
};

export interface KubernetesClusterStatus extends CatalogEntityStatus {
  phase: "connected" | "disconnected" | "deleting";
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

    await requestMain(clusterActivateHandler, this.metadata.uid, false);

    return;
  }

  async disconnect(): Promise<void> {
    if (app) {
      const cluster = ClusterStore.getInstance().getById(this.metadata.uid);

      if (!cluster) return;

      cluster.disconnect();

      return;
    }

    await requestMain(clusterDisconnectHandler, this.metadata.uid, false);

    return;
  }

  async onRun(context: CatalogEntityActionContext) {
    context.navigate(`/cluster/${this.metadata.uid}`);
  }

  onDetailsOpen(): void {
    //
  }

  onSettingsOpen(): void {
    //
  }

  async onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    if (!this.metadata.source || this.metadata.source === "local") {
      context.menuItems.push(
        {
          title: "Settings",
          icon: "edit",
          onClick: () => context.navigate(`/entity/${this.metadata.uid}/settings`)
        },
        {
          title: "Delete",
          icon: "delete",
          onClick: () => {
            HotbarStore.getInstance().removeAllHotbarItems(this.getId());
            requestMain(clusterDeleteHandler, this.metadata.uid);
          },
          confirm: {
            // TODO: change this to be a <p> tag with better formatting once this code can accept it.
            message: `Delete the "${this.metadata.name}" context from "${this.metadata.labels.file}"?`
          }
        },
      );
    }

    if (this.status.phase == "connected") {
      context.menuItems.push({
        title: "Disconnect",
        icon: "link_off",
        onClick: () => requestMain(clusterDisconnectHandler, this.metadata.uid)
      });
    } else {
      context.menuItems.push({
        title: "Connect",
        icon: "link",
        onClick: () => context.navigate(`/cluster/${this.metadata.uid}`)
      });
    }

    const category = catalogCategoryRegistry.getCategoryForEntity<KubernetesClusterCategory>(this);

    if (category) category.emit("contextMenuOpen", this, context);
  }
}

export class KubernetesClusterCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Kubernetes Clusters",
    icon: require(`!!raw-loader!./icons/kubernetes.svg`).default, // eslint-disable-line
  };
  public spec: CatalogCategorySpec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: KubernetesCluster
      }
    ],
    names: {
      kind: "KubernetesCluster"
    }
  };

  constructor() {
    super();

    this.on("catalogAddMenu", (ctx: CatalogEntityAddMenuContext) => {
      ctx.menuItems.push({
        icon: "text_snippet",
        title: "Add from kubeconfig",
        onClick: () => {
          ctx.navigate(addClusterURL());
        }
      });
    });
  }
}

catalogCategoryRegistry.add(new KubernetesClusterCategory());
