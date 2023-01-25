/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clusterMetadataDetectorInjectionToken } from "./token";
import { ClusterMetadataKey } from "../../common/cluster-types";
import { getInjectable } from "@ogre-tools/injectable";
import k8SRequestInjectable from "../k8s-request.injectable";
import type { Cluster } from "../../common/cluster/cluster";

const clusterNodeCountDetectorInjectable = getInjectable({
  id: "cluster-node-count-detector",
  instantiate: (di) => {
    const k8sRequest = di.inject(k8SRequestInjectable);
    const requestNodeCount = async (cluster: Cluster) => {
      const { items } = await k8sRequest(cluster, "/api/v1/nodes") as { items: unknown[] };

      return items.length;
    };

    return {
      key: ClusterMetadataKey.NODES_COUNT,
      detect: async (cluster) => {
        try {
          return {
            value: await requestNodeCount(cluster),
            accuracy: 1000,
          };
        } catch {
          return null;
        }
      },
    };
  },
  injectionToken: clusterMetadataDetectorInjectionToken,
});

export default clusterNodeCountDetectorInjectable;

