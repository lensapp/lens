/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import fs from "fs";
import "../../common/catalog-entities/kubernetes-cluster";
import { ClusterStore } from "../../common/cluster/store";
import { catalogCategoryRegistry } from "../api/catalog-category-registry";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import { loadConfigFromString } from "../../common/kube-helpers";
import type { DeleteClusterDialogModel } from "../components/delete-cluster-dialog/delete-cluster-dialog-model/delete-cluster-dialog-model";

async function onClusterDelete(clusterId: string, deleteClusterDialogModel: DeleteClusterDialogModel) {
  const cluster = ClusterStore.getInstance().getById(clusterId);

  if (!cluster) {
    return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
  }

  const { config, error } = loadConfigFromString(await fs.promises.readFile(cluster.kubeConfigPath, "utf-8"));

  if (error) {
    throw error;
  }

  deleteClusterDialogModel.open({ cluster, config });
}

interface Dependencies {
  openCommandDialog: (component: React.ReactElement) => void;
  deleteClusterDialogModel: DeleteClusterDialogModel;
}

export function initCatalog({ openCommandDialog, deleteClusterDialogModel }: Dependencies) {
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
          onClick: () => onClusterDelete(entity.getId(), deleteClusterDialogModel),
        });
      }
    });
}
