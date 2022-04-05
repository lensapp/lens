/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, reaction } from "mobx";
import type { ClusterStore } from "../../../common/cluster-store/cluster-store";
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import type { ClusterId, KubeAuthUpdate } from "../../../common/cluster-types";
import ipcRendererInjectable from "../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import type { ClusterConnectionStatusState } from "./cluster-status.state.injectable";

function computeRisingEdgeForClusterDisconnect(store: ClusterStore, onNewlyDisconnected: (clusterId: ClusterId) => void) {
  const disconnectedStateComputer = () => store.clustersList.map(cluster => [cluster.id, cluster.disconnected] as const);
  const state = new Map(disconnectedStateComputer());

  reaction(
    disconnectedStateComputer,
    (disconnectedStates) => {
      for (const [clusterId, isDisconnected] of disconnectedStates) {
        if (state.get(clusterId) === isDisconnected) {
          // do nothing
        } else {
          state.set(clusterId, isDisconnected); // save the new state

          if (isDisconnected) {
            // If the new value is `true` then the previous value was falsy and this is the rising edge.
            onNewlyDisconnected(clusterId);
          }
        }
      }
    },
  );
}

// This needs to be an `init` function to bypass a bug in the setup -> injectable -> setup path
const initClusterStatusWatcherInjectable = getInjectable({
  id: "cluster-status-watcher",
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const clusterStore = di.inject(clusterStoreInjectable);

    return (state: ClusterConnectionStatusState) => {
      ipcRenderer.on("cluster:connection-update", (evt, clusterId: ClusterId, update: KubeAuthUpdate) => {
        state.forCluster(clusterId).appendAuthUpdate(update);
      });
      computeRisingEdgeForClusterDisconnect(clusterStore, action((clusterId) => {
        const forCluster = state.forCluster(clusterId);

        forCluster.clearReconnectingState();
        forCluster.resetAuthOutput();
      }));
    };
  },
});

export default initClusterStatusWatcherInjectable;
