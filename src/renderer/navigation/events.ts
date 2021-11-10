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

import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { getMatchedClusterId, navigate } from "./helpers";
import { broadcastMessage, ipcRendererOn } from "../../common/ipc";
import logger from "../../common/logger";

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
