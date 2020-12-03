// Navigation helpers

import { ipcRenderer } from "electron";
import logger from "../../main/logger";
import { reaction } from "mobx";
import { createObservableHistory } from "mobx-observable-history";
import { createBrowserHistory, createMemoryHistory } from "history";
import { broadcastMessage, subscribeToBroadcast } from "../../common/ipc";
import { getMatchedClusterId, navigate } from "./helpers";
import { UrlParam, UrlParamInit } from "./url-param";

export let history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();
export let navigation = createObservableHistory(history);

export function createUrlParam<V = string>(init: UrlParamInit<V>) {
  return new UrlParam<V>(init, navigation);
}

if (ipcRenderer) {
  history = createBrowserHistory();
  navigation = createObservableHistory(history);

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

// Re-exports from sub-modules
export * from "./helpers";
export * from "./url-param";

