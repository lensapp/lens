/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { catalogCategoryRegistry } from "../catalog/catalog-category-registry";
import { CatalogEntity, CatalogEntityActionContext, CatalogEntityContextMenuContext, CatalogEntityMetadata, CatalogEntityStatus, CatalogCategory, CatalogCategorySpec } from "../catalog";
import { clusterActivateHandler, clusterDisconnectHandler } from "../cluster-ipc";
import { ClusterStore } from "../cluster-store/cluster-store";
import { broadcastMessage, requestMain } from "../ipc";
import { app } from "electron";
import type { CatalogEntitySpec } from "../catalog/catalog-entity";
import { IpcRendererNavigationEvents } from "../../renderer/navigation/events";

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
  accessibleNamespaces?: string[];
}

export enum LensKubernetesClusterStatus {
  DELETING = "deleting",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export interface KubernetesClusterMetadata extends CatalogEntityMetadata {
  distro?: string;
  kubeVersion?: string;
}

/**
 * @deprecated This is no longer used as it is incorrect. Other sources can add more values
 */
export type KubernetesClusterStatusPhase = "connected" | "connecting" | "disconnected" | "deleting";

export interface KubernetesClusterStatus extends CatalogEntityStatus {
}

export class KubernetesCluster extends CatalogEntity<KubernetesClusterMetadata, KubernetesClusterStatus, KubernetesClusterSpec> {
  public static readonly apiVersion: string = "entity.k8slens.dev/v1alpha1";
  public static readonly kind: string = "KubernetesCluster";

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
      context.menuItems.push({
        title: "Settings",
        icon: "settings",
        onClick: () => broadcastMessage(
          IpcRendererNavigationEvents.NAVIGATE_IN_APP,
          `/entity/${this.metadata.uid}/settings`,
        ),
      });
    }

    switch (this.status.phase) {
      case LensKubernetesClusterStatus.CONNECTED:
      case LensKubernetesClusterStatus.CONNECTING:
        context.menuItems.push({
          title: "Disconnect",
          icon: "link_off",
          onClick: () => requestMain(clusterDisconnectHandler, this.metadata.uid),
        });
        break;
      case LensKubernetesClusterStatus.DISCONNECTED:
        context.menuItems.push({
          title: "Connect",
          icon: "link",
          onClick: () => context.navigate(`/cluster/${this.metadata.uid}`),
        });
        break;
    }

    catalogCategoryRegistry
      .getCategoryForEntity<KubernetesClusterCategory>(this)
      ?.emit("contextMenuOpen", this, context);
  }
}

class KubernetesClusterCategory extends CatalogCategory {
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
        entityClass: KubernetesCluster,
      },
    ],
    names: {
      kind: "KubernetesCluster",
    },
  };
}

export const kubernetesClusterCategory = new KubernetesClusterCategory();

catalogCategoryRegistry.add(kubernetesClusterCategory);
