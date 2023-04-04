/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clustersInjectable from "../../../features/cluster/storage/common/clusters.injectable";
import clusterConnectionInjectable from "../../cluster/cluster-connection.injectable";
import { afterQuitOfFrontEndInjectionToken } from "../runnable-tokens/phases";

const stopClusterManagerInjectable = getInjectable({
  id: "stop-cluster-manager",

  instantiate: (di) => ({
    run: () => {
      const clusters = di.inject(clustersInjectable);

      for (const cluster of clusters.get()) {
        di.inject(clusterConnectionInjectable, cluster).disconnect();
      }

      return undefined;
    },
  }),

  injectionToken: afterQuitOfFrontEndInjectionToken,
});

export default stopClusterManagerInjectable;
