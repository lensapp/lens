/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterManagerInjectable from "../cluster-manager.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import ipcMainInjectable from "../utils/channel/ipc-main/ipc-main.injectable";

const clusterManagerIpcNetworkListenersInjectable = getInjectable({
  id: "cluster-manager-ipc-network-listeners",
  instantiate: (di) => {
    const manager = di.inject(clusterManagerInjectable);
    const ipcMain = di.inject(ipcMainInjectable);

    return {
      run: () => {
        ipcMain.on("network:offline", manager.onNetworkOffline);
        ipcMain.on("network:online", manager.onNetworkOnline);
      },
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default clusterManagerIpcNetworkListenersInjectable;
