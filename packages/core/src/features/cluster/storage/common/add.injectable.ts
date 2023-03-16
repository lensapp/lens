/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import readClusterConfigSyncInjectable from "./read-cluster-config.injectable";
import type { ClusterModel } from "../../../../common/cluster-types";
import { Cluster } from "../../../../common/cluster/cluster";
import clustersStateInjectable from "./state.injectable";

export type AddCluster = (clusterOrModel: ClusterModel | Cluster) => Cluster;

const addClusterInjectable = getInjectable({
  id: "add-cluster",
  instantiate: (di): AddCluster => {
    const clustersState = di.inject(clustersStateInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const readClusterConfigSync = di.inject(readClusterConfigSyncInjectable);

    return action((clusterOrModel) => {
      emitAppEvent({ name: "cluster", action: "add" });

      const cluster = clusterOrModel instanceof Cluster
        ? clusterOrModel
        : new Cluster(
          clusterOrModel,
          readClusterConfigSync(clusterOrModel),
        );

      clustersState.set(cluster.id, cluster);

      return cluster;
    });
  },
});

export default addClusterInjectable;
