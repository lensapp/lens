/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcMainInvokeEvent } from "electron";
import { BrowserWindow, Menu } from "electron";
import { clusterFrameMap } from "../../../../common/cluster-frames";
import { clusterActivateHandler, clusterSetFrameIdHandler, clusterDisconnectHandler, clusterStates } from "../../../../common/ipc/cluster";
import type { ClusterId } from "../../../../common/cluster-types";
import type { ClusterStore } from "../../../../common/cluster-store/cluster-store";
import { broadcastMainChannel, broadcastMessage, ipcMainHandle, ipcMainOn } from "../../../../common/ipc";
import type { CatalogEntityRegistry } from "../../../catalog";
import { pushCatalogToRenderer } from "../../../catalog-pusher";
import type { IComputedValue } from "mobx";
import { windowActionHandleChannel, windowLocationChangedChannel, windowOpenAppMenuAsContextMenuChannel } from "../../../../common/ipc/window";
import { handleWindowAction, onLocationChange } from "../../../ipc/window";
import type { ApplicationMenuItemTypes } from "../../../../features/application-menu/main/menu-items/application-menu-item-injection-token";
import type { Composite } from "../../../../common/utils/composite/get-composite/get-composite";
import { getApplicationMenuTemplate } from "../../../../features/application-menu/main/populate-application-menu.injectable";
import type { MenuItemRoot } from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import type { EmitAppEvent } from "../../../../common/app-event-bus/emit-event.injectable";
import type { GetClusterById } from "../../../../common/cluster-store/get-by-id.injectable";
interface Dependencies {
  applicationMenuItemComposite: IComputedValue<Composite<ApplicationMenuItemTypes | MenuItemRoot>>;
  catalogEntityRegistry: CatalogEntityRegistry;
  clusterStore: ClusterStore;
  emitAppEvent: EmitAppEvent;
  getClusterById: GetClusterById;
}

export const setupIpcMainHandlers = ({
  applicationMenuItemComposite,
  catalogEntityRegistry,
  clusterStore,
  emitAppEvent,
  getClusterById,
}: Dependencies) => {
  ipcMainHandle(clusterActivateHandler, (event, clusterId: ClusterId, force = false) => {
    return getClusterById(clusterId)
      ?.activate(force);
  });

  ipcMainHandle(clusterSetFrameIdHandler, (event: IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = getClusterById(clusterId);

    if (cluster) {
      clusterFrameMap.set(cluster.id, { frameId: event.frameId, processId: event.processId });

      pushCatalogToRenderer(catalogEntityRegistry);
    }
  });

  ipcMainHandle(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    emitAppEvent({ name: "cluster", action: "stop" });
    const cluster = getClusterById(clusterId);

    if (cluster) {
      cluster.disconnect();
      clusterFrameMap.delete(cluster.id);
    }
  });

  ipcMainHandle(windowActionHandleChannel, (event, action) => handleWindowAction(action));

  ipcMainOn(windowLocationChangedChannel, () => onLocationChange());

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

  ipcMainHandle(clusterStates, () => (
    clusterStore.clustersList.map(cluster => ({
      id: cluster.id,
      state: cluster.getState(),
    }))
  ));
};
