/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import k8SRequestInjectable from "../k8s-request.injectable";

const requestClusterVersionInjectable = getInjectable({
  id: "request-cluster-version",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8SRequestInjectable);

    return async (cluster: Cluster) => {
      const { gitVersion } = await k8sRequest(cluster, "/version") as { gitVersion: string };

      return gitVersion;
    };
  },
});

export default requestClusterVersionInjectable;
