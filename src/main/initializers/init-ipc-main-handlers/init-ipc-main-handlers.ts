/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow, IpcMainInvokeEvent, Menu } from "electron";
import { clusterFrameMap } from "../../../common/cluster-frames";
import { clusterActivateHandler, clusterSetFrameIdHandler, clusterVisibilityHandler, clusterRefreshHandler, clusterDisconnectHandler, clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler, clusterDeleteHandler, clusterSetDeletingHandler, clusterClearDeletingHandler } from "../../../common/ipc/cluster";
import type { ClusterId } from "../../../common/cluster-types";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import { appEventBus } from "../../../common/app-event-bus/event-bus";
import { broadcastMainChannel, broadcastMessage, ipcMainHandle, ipcMainOn } from "../../../common/ipc";
import { catalogEntityRegistry } from "../../catalog";
import { pushCatalogToRenderer } from "../../catalog-pusher";
import { ClusterManager } from "../../cluster-manager";
import { ResourceApplier } from "../../resource-applier";
import { WindowManager } from "../../window-manager";
import path from "path";
import { remove } from "fs-extra";
import { getAppMenu } from "../../menu/menu";
import type { MenuRegistration } from "../../menu/menu-registration";
import type { IComputedValue } from "mobx";
import { onLocationChange, handleWindowAction } from "../../ipc/window";
import { openFilePickingDialogChannel } from "../../../common/ipc/dialog";
import { showOpenDialog } from "../../ipc/dialog";
import { windowActionHandleChannel, windowLocationChangedChannel, windowOpenAppMenuAsContextMenuChannel } from "../../../common/ipc/window";

interface Dependencies {
  electronMenuItems: IComputedValue<MenuRegistration[]>,
  directoryForLensLocalStorage: string;
}

export const initIpcMainHandlers = ({ electronMenuItems, directoryForLensLocalStorage }: Dependencies) => () => {
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
      const localStorageFilePath = path.resolve(directoryForLensLocalStorage, `${cluster.id}.json`);

      await remove(localStorageFilePath);
    } catch {
      // ignore error
    }
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

  ipcMainHandle(windowActionHandleChannel, (event, action) => handleWindowAction(action));

  ipcMainOn(windowLocationChangedChannel, () => onLocationChange());

  ipcMainHandle(openFilePickingDialogChannel, (event, opts) => showOpenDialog(opts));

  ipcMainHandle(broadcastMainChannel, (event, channel, ...args) => broadcastMessage(channel, ...args));

  ipcMainOn(windowOpenAppMenuAsContextMenuChannel, async (event) => {
    const menu = Menu.buildFromTemplate(getAppMenu(WindowManager.getInstance(), electronMenuItems.get()));

    menu.popup({
      ...BrowserWindow.fromWebContents(event.sender),
      // Center of the topbar menu icon
      x: 20,
      y: 20,
    });
  });
};
