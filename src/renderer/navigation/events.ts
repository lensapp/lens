/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { getMatchedClusterId, navigate } from "./helpers";
import { broadcastMessage, ipcRendererOn } from "../../common/ipc";
import logger from "../../main/logger";

export const enum IpcRendererNavigationEvents {
  RELOAD_PAGE = "renderer:page-reload",
  CLUSTER_VIEW_CURRENT_ID = "renderer:cluster-id-of-active-view",
  NAVIGATE_IN_APP = "renderer:navigate",
  NAVIGATE_IN_CLUSTER = "renderer:navigate-in-cluster",
  LOADED = "renderer:loaded",
}

export function bindEvents() {
  if (!ipcRenderer) {
    return;
  }

  if (process.isMainFrame) {
    bindClusterManagerRouteEvents();
  } else {
    bindClusterFrameRouteEvents();
  }

  // Reload dashboard window
  ipcRendererOn(IpcRendererNavigationEvents.RELOAD_PAGE, () => {
    location.reload();
  });
}

// Handle events only in main window renderer process (see also: cluster-manager.tsx)
function bindClusterManagerRouteEvents() {
  // Keep track of active cluster-id for handling IPC/menus/etc.
  reaction(() => getMatchedClusterId(), clusterId => {
    broadcastMessage(IpcRendererNavigationEvents.CLUSTER_VIEW_CURRENT_ID, clusterId);
  }, {
    fireImmediately: true,
  });

  // Handle navigation via IPC
  ipcRendererOn(IpcRendererNavigationEvents.NAVIGATE_IN_APP, (event, url: string) => {
    logger.info(`[IPC]: navigate to ${url}`, { currentLocation: location.href });
    navigate(url);
    window.focus(); // make sure that the main frame is focused
  });
}

// Handle cluster-view renderer process events within iframes
function bindClusterFrameRouteEvents() {
  ipcRendererOn(IpcRendererNavigationEvents.NAVIGATE_IN_CLUSTER, (event, url: string) => {
    logger.info(`[IPC]: navigate to ${url}`, { currentLocation: location.href });
    navigate(url);
  });
}
