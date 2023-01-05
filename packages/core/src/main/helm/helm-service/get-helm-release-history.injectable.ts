/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { getHistory } from "../helm-release-manager";
import loggerInjectable from "../../../common/logger.injectable";

const getHelmReleaseHistoryInjectable = getInjectable({
  id: "get-helm-release-history",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("Fetch release history");

      return getHistory(releaseName, namespace, proxyKubeconfig);
    };
  },

  causesSideEffects: true,
});

export default getHelmReleaseHistoryInjectable;
