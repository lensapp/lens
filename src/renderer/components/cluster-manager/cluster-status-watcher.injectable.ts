/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, computed, reaction } from "mobx";
import clustersInjectable from "../../../common/cluster-store/clusters.injectable";
import type { ClusterId } from "../../../common/cluster-types";
import setupAppPathsInjectable from "../../app-paths/setup-app-paths.injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import clusterConnectionStatusStateInjectable from "./cluster-status.state.injectable";

const startClusterStatusClearingInjectable = getInjectable({
  id: "cluster-status-watcher",
  instantiate: (di) => {
    const statusState = di.inject(clusterConnectionStatusStateInjectable);
    const state = new Map<string, boolean>();
    const onNewlyDisconnected = action((clusterId: ClusterId) => {
      const status = statusState.forCluster(clusterId);

      status.clearReconnectingState();
      status.resetAuthOutput();
    });

    return {
      run: () => {
        const clusters = di.inject(clustersInjectable); // This has to be in here so that it happens after the `setupAppPaths`
        const disconnectedStates = computed(() => clusters.get().map(cluster => [cluster.id, cluster.disconnected] as const));

        reaction(
          () => disconnectedStates.get(),
          states => {
            for (const [clusterId, isDisconnected] of states) {
              if (state.get(clusterId) !== isDisconnected) {
                state.set(clusterId, isDisconnected); // save the new state

                if (isDisconnected) {
                  // If the new value is `true` then the previous value was falsy and this is the rising edge.
                  onNewlyDisconnected(clusterId);
                }
              }
            }
          },
          {
            fireImmediately: true,
          },
        );
      },
      runAfter: di.inject(setupAppPathsInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default startClusterStatusClearingInjectable;
