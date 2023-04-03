/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isEqual } from "lodash";
import { autorun } from "mobx";
import type { ClusterId, ClusterState } from "../../../../common/cluster-types";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initClusterStoreInjectable from "../../storage/main/init.injectable";
import emitClusterStateUpdateInjectable from "./emit-update.injectable";
import clustersInjectable from "../../storage/common/clusters.injectable";

const setupClusterStateBroadcastingInjectable = getInjectable({
  id: "setup-cluster-state-broadcasting",
  instantiate: (di) => ({
    run: () => {
      const emitClusterStateUpdate = di.inject(emitClusterStateUpdateInjectable);
      const clusters = di.inject(clustersInjectable);
      const prevStates = new Map<ClusterId, ClusterState>();

      autorun(() => {
        for (const cluster of clusters.get()) {
          const prevState = prevStates.get(cluster.id);
          const curState = cluster.getState();

          if (!prevState || !isEqual(prevState, curState)) {
            prevStates.set(cluster.id, curState);

            emitClusterStateUpdate({
              clusterId: cluster.id,
              state: cluster.getState(),
            });
          }
        }
      });
    },
    runAfter: initClusterStoreInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupClusterStateBroadcastingInjectable;
