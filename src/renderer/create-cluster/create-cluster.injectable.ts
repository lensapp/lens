/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ClusterModel } from "../../common/cluster-types";
import { Cluster } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";

const createClusterInjectable = getInjectable({
  instantiate: (di) => {
    const dependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: () => { throw new Error("Tried to access back-end feature in front-end."); },
      createKubectl: () => { throw new Error("Tried to access back-end feature in front-end.");},
      createContextHandler: () => { throw new Error("Tried to access back-end feature in front-end."); },
    };

    return (model: ClusterModel) => new Cluster(dependencies, model);
  },

  injectionToken: createClusterInjectionToken,

  lifecycle: lifecycleEnum.singleton,
});

export default createClusterInjectable;
