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
import path from "path";
import tempy from "tempy";
import "../../common/catalog-entities/kubernetes-cluster";
import { WebLinkCategory } from "../../common/catalog-entities";
import { ClusterStore } from "../../common/cluster-store";
import { appEventBus } from "../../common/event-bus";
import { catalogCategoryRegistry } from "../api/catalog-category-registry";
import { WeblinkAddCommand } from "../components/catalog-entities/weblink-add-command";
import { CommandOverlay } from "../components/command-palette";
import { Notifications } from "../components/notifications";
import { loadConfigFromString } from "../../common/kube-helpers";
import { requestMain } from "../../common/ipc";
import { clusterClearDeletingHandler, clusterDeleteHandler, clusterSetDeletingHandler } from "../../common/cluster-ipc";
import { ControlFlow } from "../utils";
import { HotbarStore } from "../../common/hotbar-store";
import type { ClusterId } from "../../common/cluster-types";
import type { Cluster } from "../../main/cluster";
import { deleteClusterConfirmDialog } from "../components/dialog/delete-cluster-dialog";
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
          onClick: () => onClusterDelete(entity.metadata.uid)
        });
      }
    });
}

async function onClusterDelete(clusterId: string) {
  appEventBus.emit({ name: "cluster", action: "remove" });
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

async function setDeleting(cluster: Cluster): Promise<ControlFlow> {
  await requestMain(clusterSetDeletingHandler, cluster.id);

  try {
    await fs.promises.access(cluster.kubeConfigPath, fs.constants.W_OK | fs.constants.R_OK);
  } catch {
    await requestMain(clusterClearDeletingHandler, cluster.id);

    Notifications.error(
      <p>Cannot remove cluster, missing write permissions for <code>{cluster.kubeConfigPath}</code></p>
    );

    return ControlFlow.Stop;
  }

  return ControlFlow.Continue;
}

async function aquireConfigLock(cluster: Cluster, lockFilePath: string): Promise<ControlFlow> {
  try {
    const fd = await fs.promises.open(lockFilePath, "wx");

    await fd.close(); // close immeditaly as we will want to delete the file later
  } catch (error) {
    await requestMain(clusterClearDeletingHandler, cluster.id);
    console.warn("[KUBERNETES-CLUSTER]: failed to lock config file", error);

    switch (error.code) {
      case "EEXIST":
      case "EISDIR":
        Notifications.error("Cannot remove cluster, failed to aquire lock file. Already held.");
        break;
      case "EPERM":
      case "EACCES":
        Notifications.error("Cannot remove cluster, failed to aquire lock file. Permission denied.");
        break;
      default:
        Notifications.error(`Cannot remove cluster, failed to aquire lock file. ${error}`);
        break;
    }

    return ControlFlow.Stop;
  }

  return ControlFlow.Continue;
}

export async function deleteLocalCluster(clusterId: ClusterId): Promise<void> {
  appEventBus.emit({ name: "cluster", action: "remove" });
  const cluster = ClusterStore.getInstance().getById(clusterId);

  if (!cluster) {
    return console.warn("[KUBERNETES-CLUSTER]: cannot delete cluster, does not exist in store", { clusterId });
  }

  switch (await setDeleting(cluster)) {
    case ControlFlow.Stop:
      return;
  }

  const lockFilePath = `${path.resolve(cluster.kubeConfigPath)}.lock`;

  switch (await aquireConfigLock(cluster, lockFilePath)) {
    case ControlFlow.Stop:
      return;
  }

  try {
    const { config, error } = loadConfigFromString(await fs.promises.readFile(cluster.kubeConfigPath, "utf-8"));

    if (error) {
      throw error;
    }

    const [cf, selectedOption] = await deleteClusterConfirmDialog({ config, cluster });

    switch (cf) {
      case ControlFlow.Stop:
        return void await requestMain(clusterClearDeletingHandler, cluster.id);
    }

    if (selectedOption === false) {
      config.setCurrentContext(undefined);
    } else {
      config.setCurrentContext(selectedOption);
    }

    config.contexts = config.contexts.filter(context => context.name !== cluster.contextName);

    const tmpFilePath = tempy.file();

    await fs.promises.writeFile(tmpFilePath, config.exportConfig());
    await fs.promises.rename(tmpFilePath, cluster.kubeConfigPath);
    await requestMain(clusterDeleteHandler, clusterId);
    HotbarStore.getInstance().removeAllHotbarItems(clusterId);
  } catch (error) {
    await requestMain(clusterClearDeletingHandler, clusterId);
    console.warn("[KUBERNETES-CLUSTER]: failed to read or parse kube config file", error);

    return void Notifications.error(`Cannot remove cluster, failed to process config file. ${error}`);
  } finally {
    await fs.promises.unlink(lockFilePath); // always unlink the file
  }
}
