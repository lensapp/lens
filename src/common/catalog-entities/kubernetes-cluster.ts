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
import type { CatalogEntitySpec } from "../catalog/catalog-entity";
import { HotbarStore } from "../hotbar-store";

export interface KubernetesClusterPrometheusMetrics {
  address?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  type?: string;
}

export interface KubernetesClusterSpec extends CatalogEntitySpec {
  kubeconfigPath: string;
  kubeconfigContext: string;
  metrics?: {
    source: string;
    prometheus?: KubernetesClusterPrometheusMetrics;
  };
  icon?: {
    // TODO: move to CatalogEntitySpec once any-entity icons are supported
    src?: string;
    material?: string;
    background?: string;
  };
}

export interface KubernetesClusterMetadata extends CatalogEntityMetadata {
  distro?: string;
  kubeVersion?: string;
}

export type KubernetesClusterStatusPhase = "connected" | "connecting" | "disconnected" | "deleting";

export interface KubernetesClusterStatus extends CatalogEntityStatus {
  phase: KubernetesClusterStatusPhase;
}

export class KubernetesCluster extends CatalogEntity<KubernetesClusterMetadata, KubernetesClusterStatus, KubernetesClusterSpec> {
  public static readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public static readonly kind = "KubernetesCluster";

  public readonly apiVersion = KubernetesCluster.apiVersion;
  public readonly kind = KubernetesCluster.kind;

  async connect(): Promise<void> {
    if (app) {
      await ClusterStore.getInstance().getById(this.metadata.uid)?.activate();
    } else {
      await requestMain(clusterActivateHandler, this.metadata.uid, false);
    }
  }

  async disconnect(): Promise<void> {
    if (app) {
      ClusterStore.getInstance().getById(this.metadata.uid)?.disconnect();
    } else {
      await requestMain(clusterDisconnectHandler, this.metadata.uid, false);
    }
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
            message: `Delete the "${this.metadata.name}" context from "${this.spec.kubeconfigPath}"?`
          }
        },
      );
    }

    switch (this.status.phase) {
      case "connected":
      case "connecting":
        context.menuItems.push({
          title: "Disconnect",
          icon: "link_off",
          onClick: () => requestMain(clusterDisconnectHandler, this.metadata.uid)
        });
        break;
      case "disconnected":
        context.menuItems.push({
          title: "Connect",
          icon: "link",
          onClick: () => context.navigate(`/cluster/${this.metadata.uid}`)
        });
        break;
    }

    catalogCategoryRegistry
      .getCategoryForEntity<KubernetesClusterCategory>(this)
      ?.emit("contextMenuOpen", this, context);
  }
}

export class KubernetesClusterCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Clusters",
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
