/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcMainInvokeEvent } from "electron";
import { BrowserWindow, Menu } from "electron";
import { clusterFrameMap } from "../../../../common/cluster-frames";
import { clusterActivateHandler, clusterSetFrameIdHandler, clusterVisibilityHandler, clusterRefreshHandler, clusterDisconnectHandler, clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler } from "../../../../common/ipc/cluster";
import type { ClusterId } from "../../../../common/cluster-types";
import { ClusterStore } from "../../../../common/cluster-store/cluster-store";
import { broadcastMainChannel, broadcastMessage, ipcMainHandle, ipcMainOn } from "../../../../common/ipc";
import type { CatalogEntityRegistry } from "../../../catalog";
import { pushCatalogToRenderer } from "../../../catalog-pusher";
import type { ClusterManager } from "../../../cluster/manager";
import type { IComputedValue } from "mobx";
import { windowActionHandleChannel, windowLocationChangedChannel, windowOpenAppMenuAsContextMenuChannel } from "../../../../common/ipc/window";
import { handleWindowAction, onLocationChange } from "../../../ipc/window";
import { openFilePickingDialogChannel } from "../../../../common/ipc/dialog";
import { getNativeThemeChannel } from "../../../../common/ipc/native-theme";
import type { Theme } from "../../../theme/operating-system-theme-state.injectable";
import type { AskUserForFilePaths } from "../../../ipc/ask-user-for-file-paths.injectable";
import type { ApplicationMenuItemTypes } from "../../../../features/application-menu/main/menu-items/application-menu-item-injection-token";
import type { Composite } from "../../../../common/utils/composite/get-composite/get-composite";
import { getApplicationMenuTemplate } from "../../../../features/application-menu/main/populate-application-menu.injectable";
import type { MenuItemRoot } from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import type { EmitAppEvent } from "../../../../common/app-event-bus/emit-event.injectable";
import type { CreateResourceApplier } from "../../../resource-applier/create-resource-applier.injectable";

interface Dependencies {
  applicationMenuItemComposite: IComputedValue<Composite<ApplicationMenuItemTypes | MenuItemRoot>>;
  clusterManager: ClusterManager;
  catalogEntityRegistry: CatalogEntityRegistry;
  clusterStore: ClusterStore;
  operatingSystemTheme: IComputedValue<Theme>;
  askUserForFilePaths: AskUserForFilePaths;
  emitAppEvent: EmitAppEvent;
  createResourceApplier: CreateResourceApplier;
}

export const setupIpcMainHandlers = ({
  applicationMenuItemComposite,
  clusterManager,
  catalogEntityRegistry,
  clusterStore,
  operatingSystemTheme,
  askUserForFilePaths,
  emitAppEvent,
  createResourceApplier,
}: Dependencies) => {
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
    clusterManager.visibleCluster = clusterId;
  });

  ipcMainHandle(clusterRefreshHandler, (event, clusterId: ClusterId) => {
    return ClusterStore.getInstance()
      .getById(clusterId)
      ?.refresh({ refreshMetadata: true });
  });

  ipcMainHandle(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    emitAppEvent({ name: "cluster", action: "stop" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  });

  ipcMainHandle(clusterKubectlApplyAllHandler, async (event, clusterId: ClusterId, resources: string[], extraArgs: string[]) => {
    emitAppEvent({ name: "cluster", action: "kubectl-apply-all" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = createResourceApplier(cluster);

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
    emitAppEvent({ name: "cluster", action: "kubectl-delete-all" });
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      const applier = createResourceApplier(cluster);

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

  ipcMainHandle(openFilePickingDialogChannel, (event, opts) => askUserForFilePaths(opts));

  ipcMainHandle(broadcastMainChannel, (event, channel, ...args) => broadcastMessage(channel, ...args));

  ipcMainOn(windowOpenAppMenuAsContextMenuChannel, async (event) => {
    const electronTemplate = getApplicationMenuTemplate(applicationMenuItemComposite.get());
    const menu = Menu.buildFromTemplate(electronTemplate);

    menu.popup({
      ...BrowserWindow.fromWebContents(event.sender),
      // Center of the topbar menu icon
      x: 20,
      y: 20,
    });
  });

  ipcMainHandle(getNativeThemeChannel, () => {
    return operatingSystemTheme.get();
  });

  clusterStore.provideInitialFromMain();
};
