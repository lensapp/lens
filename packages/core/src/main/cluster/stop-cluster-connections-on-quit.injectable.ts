/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clustersInjectable from "../../features/cluster/storage/common/clusters.injectable";
import { onQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/phases";
import clusterConnectionInjectable from "./cluster-connection.injectable";

const stopAllClusterConnectionsOnQuitInjectable = getInjectable({
  id: "stop-all-cluster-connections-on-quit",
  instantiate: (di) => ({
    run: () => {
      const clusters = di.inject(clustersInjectable).get();

      for (const cluster of clusters) {
        di.inject(clusterConnectionInjectable, cluster).disconnect();
      }
    },
  }),
  injectionToken: onQuitOfBackEndInjectionToken,
});

export default stopAllClusterConnectionsOnQuitInjectable;
