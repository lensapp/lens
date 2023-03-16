/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IpcMainInvokeEvent } from "electron";
import { BrowserWindow, Menu } from "electron";
import type { ClusterFrameInfo } from "../../../../common/cluster-frames.injectable";
import { clusterSetFrameIdHandler, clusterStates } from "../../../../common/ipc/cluster";
import type { ClusterId } from "../../../../common/cluster-types";
import { broadcastMainChannel, broadcastMessage, ipcMainHandle, ipcMainOn } from "../../../../common/ipc";
import type { IComputedValue, ObservableMap } from "mobx";
import { windowActionHandleChannel, windowLocationChangedChannel, windowOpenAppMenuAsContextMenuChannel } from "../../../../common/ipc/window";
import { handleWindowAction, onLocationChange } from "../../../ipc/window";
import type { ApplicationMenuItemTypes } from "../../../../features/application-menu/main/menu-items/application-menu-item-injection-token";
import type { Composite } from "../../../../common/utils/composite/get-composite/get-composite";
import { getApplicationMenuTemplate } from "../../../../features/application-menu/main/populate-application-menu.injectable";
import type { MenuItemRoot } from "../../../../features/application-menu/main/application-menu-item-composite.injectable";
import type { GetClusterById } from "../../../../features/cluster/storage/common/get-by-id.injectable";
import type { Cluster } from "../../../../common/cluster/cluster";

interface Dependencies {
  applicationMenuItemComposite: IComputedValue<Composite<ApplicationMenuItemTypes | MenuItemRoot>>;
  getClusterById: GetClusterById;
  pushCatalogToRenderer: () => void;
  clusterFrames: ObservableMap<string, ClusterFrameInfo>;
  clusters: IComputedValue<Cluster[]>;
}

export const setupIpcMainHandlers = ({
  applicationMenuItemComposite,
  getClusterById,
  pushCatalogToRenderer,
  clusterFrames,
  clusters,
}: Dependencies) => {
  ipcMainHandle(clusterSetFrameIdHandler, (event: IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = getClusterById(clusterId);

    if (cluster) {
      clusterFrames.set(cluster.id, { frameId: event.frameId, processId: event.processId });
      pushCatalogToRenderer();
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
    clusters.get().map(cluster => ({
      id: cluster.id,
      state: cluster.getState(),
    }))
  ));
};
