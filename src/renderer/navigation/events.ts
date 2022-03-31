/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { broadcastMessage, ipcRendererOn } from "../../common/ipc";
import {
  getLegacyGlobalDiForExtensionApi,
} from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import matchedClusterIdInjectable from "./matched-cluster-id.injectable";

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
  }

  // Reload dashboard window
  ipcRendererOn(IpcRendererNavigationEvents.RELOAD_PAGE, () => {
    location.reload();
  });
}

// Handle events only in main window renderer process (see also: cluster-manager.tsx)
function bindClusterManagerRouteEvents() {
  const di = getLegacyGlobalDiForExtensionApi();

  const matchedClusterId = di.inject(matchedClusterIdInjectable);

  // Keep track of active cluster-id for handling IPC/menus/etc.
  reaction(() => matchedClusterId.get(), clusterId => {
    broadcastMessage(IpcRendererNavigationEvents.CLUSTER_VIEW_CURRENT_ID, clusterId);
  }, {
    fireImmediately: true,
  });
}
