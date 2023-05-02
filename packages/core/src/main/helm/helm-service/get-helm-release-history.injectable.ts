/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { loggerInjectionToken } from "@k8slens/logger";
import kubeconfigManagerInjectable from "../../kubeconfig-manager/kubeconfig-manager.injectable";
import type { GetHelmReleaseHistoryData } from "../get-helm-release-history.injectable";
import getHelmReleaseHistoryInjectable from "../get-helm-release-history.injectable";

const getClusterHelmReleaseHistoryInjectable = getInjectable({
  id: "get-cluster-helm-release-history",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectionToken);
    const getHelmReleaseHistory = di.inject(getHelmReleaseHistoryInjectable);

    return async (cluster: Cluster, data: GetHelmReleaseHistoryData) => {
      const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);
      const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();

      logger.debug(`[CLUSTER]: Fetch release history for clusterId=${cluster.id}`, data);

      return getHelmReleaseHistory(proxyKubeconfigPath, data);
    };
  },
});

export default getClusterHelmReleaseHistoryInjectable;
