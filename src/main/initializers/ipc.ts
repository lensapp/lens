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

import { BrowserWindow, dialog, IpcMainInvokeEvent } from "electron";
import { clusterFrameMap } from "../../common/cluster-frames";
import { clusterActivateHandler, clusterSetFrameIdHandler, clusterVisibilityHandler, clusterRefreshHandler, clusterDisconnectHandler, clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler, clusterDeleteHandler, clusterSetDeletingHandler, clusterClearDeletingHandler } from "../../common/cluster-ipc";
import type { ClusterId } from "../../common/cluster-types";
import { ClusterStore } from "../../common/cluster-store";
import { appEventBus } from "../../common/event-bus";
import { dialogShowOpenDialogHandler, ipcMainHandle, ipcMainOn } from "../../common/ipc";
import { catalogEntityRegistry } from "../catalog";
import { pushCatalogToRenderer } from "../catalog-pusher";
import { ClusterManager } from "../cluster-manager";
import { ResourceApplier } from "../resource-applier";
import { WindowManager } from "../window-manager";
import path from "path";
import { remove } from "fs-extra";
import { AppPaths } from "../../common/app-paths";

export function initIpcMainHandlers() {
  ipcMainHandle(clusterActivateHandler, (event, clusterId: ClusterId, force = false) => {
    return ClusterStore.getInstance()
      .getById(clusterId)
      ?.activate(force);
  });

  ipcMainHandle(clusterSetFrameIdHandler, (event: IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      clusterFrameMap.set(cluster.id, { frameId: event.frameId, processId: event.processId });
      cluster.pushState();

      pushCatalogToRenderer(catalogEntityRegistry);
    }
  });

  ipcMainOn(clusterVisibilityHandler, (event, clusterId?: ClusterId) => {
    ClusterManager.getInstance().visibleCluster = clusterId;
  });

  ipcMainHandle(clusterRefreshHandler, (event, clusterId: ClusterId) => {
    return ClusterStore.getInstance()
      .getById(clusterId)
      ?.refresh({ refreshMetadata: true });
  });

  ipcMainHandle(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    appEventBus.emit({ name: "cluster", action: "stop" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  });

  ipcMainHandle(clusterDeleteHandler, async (event, clusterId: ClusterId) => {
    appEventBus.emit({ name: "cluster", action: "remove" });

    const clusterStore = ClusterStore.getInstance();
    const cluster = clusterStore.getById(clusterId);

    if (!cluster) {
      return;
    }

    cluster.disconnect();
    clusterFrameMap.delete(cluster.id);

    // Remove from the cluster store as well, this should clear any old settings
    clusterStore.clusters.delete(cluster.id);

    try {
      // remove the local storage file
      const localStorageFilePath = path.resolve(AppPaths.get("userData"), "lens-local-storage", `${cluster.id}.json`);

      await remove(localStorageFilePath);
    } catch {}
  });

  ipcMainHandle(clusterSetDeletingHandler, (event, clusterId: string) => {
    ClusterManager.getInstance().deleting.add(clusterId);
  });

  ipcMainHandle(clusterClearDeletingHandler, (event, clusterId: string) => {
    ClusterManager.getInstance().deleting.delete(clusterId);
  });

  ipcMainHandle(clusterKubectlApplyAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-apply-all" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = new ResourceApplier(cluster);

      try {
        const stdout = await applier.kubectlApplyAll(resources, extraArgs);

        return { stdout };
      } catch (error: any) {
        return { stderr: error };
      }
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  });

  ipcMainHandle(clusterKubectlDeleteAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-delete-all" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = new ResourceApplier(cluster);

      try {
        const stdout = await applier.kubectlDeleteAll(resources, extraArgs);

        return { stdout };
      } catch (error: any) {
        return { stderr: error };
      }
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  });

  ipcMainHandle(dialogShowOpenDialogHandler, async (event, dialogOpts: Electron.OpenDialogOptions) => {
    await WindowManager.getInstance().ensureMainWindow();

    return dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), dialogOpts);
  });
}
