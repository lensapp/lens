/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clusterMetadataDetectorInjectionToken } from "./token";
import { ClusterMetadataKey } from "../../common/cluster-types";
import { getInjectable } from "@ogre-tools/injectable";
import requestClusterVersionInjectable from "./request-cluster-version.injectable";

const clusterLastSeenDetectorInjectable = getInjectable({
  id: "cluster-last-seen-detector",
  instantiate: (di) => {
    const requestClusterVersion = di.inject(requestClusterVersionInjectable);

    return {
      key: ClusterMetadataKey.LAST_SEEN,
      detect: async (cluster) => {
        try {
          await requestClusterVersion(cluster);

          return { value: new Date().toJSON(), accuracy: 100 };
        } catch {
          return null;
        }
      },
    };
  },
  injectionToken: clusterMetadataDetectorInjectionToken,
});

export default clusterLastSeenDetectorInjectable;
