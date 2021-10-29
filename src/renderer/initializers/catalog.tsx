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

import React from "react";
import fs from "fs";
import "../../common/catalog-entities/kubernetes-cluster";
import { WebLinkCategory } from "../../common/catalog-entities";
import { ClusterStore } from "../../common/cluster-store";
import { catalogCategoryRegistry } from "../api/catalog-category-registry";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import { CommandOverlay } from "../components/command-palette";
import { loadConfigFromString } from "../../common/kube-helpers";
import { DeleteClusterDialog } from "../components/delete-cluster-dialog";

function initWebLinks() {
  WebLinkCategory.onAdd = () => CommandOverlay.open(<WeblinkAddCommand />);
}

function initKubernetesClusters() {
  catalogCategoryRegistry
    .getForGroupKind("entity.k8slens.dev", "KubernetesCluster")
    .on("contextMenuOpen", (entity, context) => {
      if (entity.metadata?.source == "local") {
        context.menuItems.push({
          title: "Delete",
          icon: "delete",
          onClick: () => onClusterDelete(entity.metadata.uid),
        });
      }
    });
}

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

export function initCatalog() {
  initWebLinks();
  initKubernetesClusters();
}
