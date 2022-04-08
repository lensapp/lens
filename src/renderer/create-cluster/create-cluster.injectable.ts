/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterDependencies } from "../../common/cluster/cluster";
import { Cluster } from "../../common/cluster/cluster";
import directoryForKubeConfigsInjectable from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { createClusterInjectionToken } from "../../common/cluster/create-cluster-injection-token";
import loggerInjectable from "../../common/logger.injectable";

const createClusterInjectable = getInjectable({
  id: "create-cluster",

  instantiate: (di) => {
    const dependencies: ClusterDependencies = {
      directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
      createKubeconfigManager: () => undefined,
      createKubectl: () => { throw new Error("Tried to access back-end feature in front-end.");},
      createContextHandler: () => undefined,
      createAuthorizationReview: () => { throw new Error("Tried to access back-end feature in front-end."); },
      createListNamespaces: () => { throw new Error("Tried to access back-end feature in front-end."); },
      logger: di.inject(loggerInjectable),
    };

    return (model) => new Cluster(dependencies, model);
  },

  injectionToken: createClusterInjectionToken,
});

export default createClusterInjectable;
