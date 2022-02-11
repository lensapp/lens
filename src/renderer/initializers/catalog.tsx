/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import fs from "fs";
import "../../common/catalog-entities/kubernetes-cluster";
import { ClusterStore } from "../../common/cluster-store/cluster-store";
import { catalogCategoryRegistry } from "../api/catalog-category-registry";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import { loadConfigFromString } from "../../common/kube-helpers";
import { DeleteClusterDialog } from "../components/delete-cluster-dialog";

async function onClusterDelete(clusterId: string) {
  const cluster = ClusterStore.getInstance().getById(clusterId);

  if (!cluster) {
    return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
  }

  const { config, error } = loadConfigFromString(await fs.promises.readFile(cluster.kubeConfigPath, "utf-8"));

  if (error) {
    throw error;
  }

  DeleteClusterDialog.open({ cluster, config });
}

interface Dependencies {
  openCommandDialog: (component: React.ReactElement) => void;
}

export function initCatalog({ openCommandDialog }: Dependencies) {
  catalogCategoryRegistry
    .getForGroupKind("entity.k8slens.dev", "WebLink")
    .on("catalogAddMenu", ctx => {
      ctx.menuItems.push({
        title: "Add web link",
        icon: "public",
        onClick: () => openCommandDialog(<WeblinkAddCommand />),
      });
    });

  catalogCategoryRegistry
    .getForGroupKind("entity.k8slens.dev", "KubernetesCluster")
    .on("contextMenuOpen", (entity, context) => {
      if (entity.metadata?.source == "local") {
        context.menuItems.push({
          title: "Remove",
          icon: "delete",
          onClick: () => onClusterDelete(entity.getId()),
        });
      }
    });
}
