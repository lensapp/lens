/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import type { GetHelmReleaseHistoryData } from "../get-helm-release-history.injectable";
import getHelmReleaseHistoryInjectable from "../get-helm-release-history.injectable";

const getClusterHelmReleaseHistoryInjectable = getInjectable({
  id: "get-cluster-helm-release-history",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const getHelmReleaseHistory = di.inject(getHelmReleaseHistoryInjectable);

    return async (cluster: Cluster, data: GetHelmReleaseHistoryData) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug(`[CLUSTER]: Fetch release history for clusterId=${cluster.id}`, data);

      return getHelmReleaseHistory(proxyKubeconfig, data);
    };
  },
});

export default getClusterHelmReleaseHistoryInjectable;
