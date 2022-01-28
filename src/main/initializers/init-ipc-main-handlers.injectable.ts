/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow, dialog, IpcMainInvokeEvent, Menu } from "electron";
import { clusterFrameMap } from "../../common/cluster-frames";
import { clusterActivateHandler, clusterSetFrameIdHandler, clusterVisibilityHandler, clusterRefreshHandler, clusterDisconnectHandler, clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler, clusterDeleteHandler, clusterSetDeletingHandler, clusterClearDeletingHandler } from "../../common/cluster-ipc";
import type { ClusterId } from "../../common/cluster-types";
import type { ClusterStore } from "../../common/cluster-store/store";
import { appEventBus } from "../../common/app-event-bus/event-bus";
import { dialogShowOpenDialogHandler, ipcMainHandle, ipcMainOn } from "../../common/ipc";
import { pushCatalogToRenderer } from "../catalog-pusher";
import type { ClusterManager } from "../cluster-manager/cluster-manager";
import { ResourceApplier } from "../resource-applier";
import { IpcMainWindowEvents, WindowManager } from "../windows/manager";
import path from "path";
import { remove } from "fs-extra";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../renderer/utils";
import clusterManagerInjectable from "../cluster-manager/cluster-manager.injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import type { CatalogEntityRegistry } from "../catalog";
import clusterStoreInjectable from "../../common/cluster-store/store.injectable";
import directoryForLensLocalStorageInjectable from "../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import windowManagerInjectable from "../windows/manager.injectable";
import buildMenuInjectable from "../menu/build-menu.injectable";

interface InitIpcMainHandlersDependencies {
  clusterStore: ClusterStore;
  entityRegistry: CatalogEntityRegistry;
  clusterManager: ClusterManager;
  windowManager: WindowManager;
  directoryForLensLocalStorage: string;
  buildMenu: () => Menu;
}

function initIpcMainHandlers({
  entityRegistry,
  clusterStore,
  clusterManager,
  windowManager,
  directoryForLensLocalStorage,
  buildMenu,
}: InitIpcMainHandlersDependencies) {
  ipcMainHandle(clusterActivateHandler, (event, clusterId: ClusterId, force = false) => {
    return clusterStore
      .getById(clusterId)
      ?.activate(force);
  });

  ipcMainHandle(clusterSetFrameIdHandler, (event: IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = clusterStore.getById(clusterId);

    if (cluster) {
      clusterFrameMap.set(cluster.id, { frameId: event.frameId, processId: event.processId });
      cluster.pushState();

      pushCatalogToRenderer(entityRegistry);
    }
  });

  ipcMainOn(clusterVisibilityHandler, (event, clusterId?: ClusterId) => {
    clusterManager.visibleCluster = clusterId;
  });

  ipcMainHandle(clusterRefreshHandler, (event, clusterId: ClusterId) => {
    return clusterStore
      .getById(clusterId)
      ?.refresh({ refreshMetadata: true });
  });

  ipcMainHandle(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    appEventBus.emit({ name: "cluster", action: "stop" });
    const cluster = clusterStore.getById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  });

  ipcMainHandle(clusterDeleteHandler, async (event, clusterId: ClusterId) => {
    appEventBus.emit({ name: "cluster", action: "remove" });

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
    clusterManager.deleting.add(clusterId);
  });

  ipcMainHandle(clusterClearDeletingHandler, (event, clusterId: string) => {
    clusterManager.deleting.delete(clusterId);
  });

  ipcMainHandle(clusterKubectlApplyAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-apply-all" });
    const cluster = clusterStore.getById(clusterId);

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
    const cluster = clusterStore.getById(clusterId);

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
    await windowManager.ensureMainWindow();

    return dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), dialogOpts);
  });

  ipcMainOn(IpcMainWindowEvents.OPEN_CONTEXT_MENU, (event) => {
    buildMenu().popup({
      ...BrowserWindow.fromWebContents(event.sender),
      // Center of the topbar menu icon
      x: 20,
      y: 20,
    });
  });
}

const initIpcMainHandlersInjectable = getInjectable({
  instantiate: (di) => bind(initIpcMainHandlers, null, {
    clusterManager: di.inject(clusterManagerInjectable),
    clusterStore: di.inject(clusterStoreInjectable),
    windowManager: di.inject(windowManagerInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    directoryForLensLocalStorage: di.inject(directoryForLensLocalStorageInjectable),
    buildMenu: di.inject(buildMenuInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default initIpcMainHandlersInjectable;
