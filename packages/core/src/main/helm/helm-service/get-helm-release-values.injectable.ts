/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import type { GetHelmReleaseValuesData } from "../get-helm-release-values.injectable";
import getHelmReleaseValuesInjectable from "../get-helm-release-values.injectable";

const getClusterHelmReleaseValuesInjectable = getInjectable({
  id: "get-cluster-helm-release-values",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const getHelmReleaseValues = di.inject(getHelmReleaseValuesInjectable);

    return async (cluster: Cluster, data: GetHelmReleaseValuesData) => {
      const pathToKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug(`[CLUSTER]: getting helm release values`, data);

      return getHelmReleaseValues(pathToKubeconfig, data);
    };
  },
});

export default getClusterHelmReleaseValuesInjectable;
