/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import type { ClusterModel } from "../../../../common/cluster-types";
import { Cluster } from "../../../../common/cluster/cluster";
import clustersStateInjectable from "./state.injectable";
import type { Result } from "@k8slens/utilities";
import { setAndGet } from "@k8slens/utilities";
import type { ZodError } from "zod";

export type AddCluster = (clusterModel: ClusterModel) => Result<Cluster, ZodError<unknown>>;

const addClusterInjectable = getInjectable({
  id: "add-cluster",
  instantiate: (di): AddCluster => {
    const clustersState = di.inject(clustersStateInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return action((clusterModel) => {
      emitAppEvent({ name: "cluster", action: "add" });

      const result = Cluster.create(clusterModel);

      if (!result.isOk) {
        return result;
      }

      return {
        isOk: true,
        value: setAndGet(clustersState, clusterModel.id, result.value),
      };
    });
  },
});

export default addClusterInjectable;
