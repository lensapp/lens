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
    // Keep track of active cluster-id for handling IPC/menus/etc.
    reaction(() => getMatchedClusterId(), clusterId => {
      broadcastMessage("cluster-view:current-id", clusterId);
    }, {
      fireImmediately: true
    });
  }

  // Handle navigation via IPC (e.g. from top menu)
  subscribeToBroadcast("renderer:navigate", (event, url: string) => {
    logger.info(`[IPC]: ${event.type} ${JSON.stringify(url)}`, event);
    navigate(url);
  });

  // Reload dashboard window
  subscribeToBroadcast("renderer:reload", () => {
    location.reload();
  });
}
