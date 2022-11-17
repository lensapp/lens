/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import fs from "fs";
import "../../common/catalog-entities/kubernetes-cluster";
import { catalogCategoryRegistry } from "../api/catalog-category-registry";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import { loadConfigFromString } from "../../common/kube-helpers";
import type { OpenDeleteClusterDialog } from "../components/delete-cluster-dialog/open.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";

const getClusterById = asLegacyGlobalFunctionForExtensionApi(getClusterByIdInjectable);

async function onClusterDelete(clusterId: string, openDeleteClusterDialog: OpenDeleteClusterDialog) {
  const cluster = getClusterById(clusterId);

  if (!cluster) {
    return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
  }

  const result = loadConfigFromString(await fs.promises.readFile(cluster.kubeConfigPath, "utf-8"));

  if (result.error) {
    throw result.error;
  }

  openDeleteClusterDialog({ cluster, config: result.config });
}

interface Dependencies {
  openCommandDialog: (component: React.ReactElement) => void;
  openDeleteClusterDialog: OpenDeleteClusterDialog;
}

export function initCatalog({ openCommandDialog, openDeleteClusterDialog }: Dependencies) {
  catalogCategoryRegistry
    .getForGroupKind("entity.k8slens.dev", "WebLink")
    ?.on("catalogAddMenu", ctx => {
      ctx.menuItems.push({
        title: "Add web link",
        icon: "public",
        onClick: () => openCommandDialog(<WeblinkAddCommand />),
      });
    });

  catalogCategoryRegistry
    .getForGroupKind("entity.k8slens.dev", "KubernetesCluster")
    ?.on("contextMenuOpen", (entity, context) => {
      if (entity.metadata?.source == "local") {
        context.menuItems.push({
          title: "Remove",
          icon: "delete",
          onClick: () => onClusterDelete(entity.getId(), openDeleteClusterDialog),
        });
      }
    });
}
