import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { getMatchedClusterId, navigate } from "./helpers";
import { broadcastMessage, subscribeToBroadcast } from "../../common/ipc";
import logger from "../../main/logger";

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
  subscribeToBroadcast("renderer:reload", () => {
    location.reload();
  });
}

// Handle events only in main window renderer process (see also: cluster-manager.tsx)
function bindClusterManagerRouteEvents() {
  // Keep track of active cluster-id for handling IPC/menus/etc.
  reaction(() => getMatchedClusterId(), clusterId => {
    broadcastMessage("cluster-view:current-id", clusterId);
  }, {
    fireImmediately: true
  });

  // Handle navigation via IPC
  subscribeToBroadcast("renderer:navigate", (event, url: string) => {
    logger.info(`[IPC]: ${event.type}: ${url}`, { currentLocation: location.href });
    navigate(url);
  });
}

// Handle cluster-view renderer process events within iframes
function bindClusterFrameRouteEvents() {
  subscribeToBroadcast("renderer:navigate-cluster-view", (event, url: string) => {
    logger.info(`[IPC]: ${event.type}: ${url}`, { currentLocation: location.href });
    navigate(url);
  });
}
