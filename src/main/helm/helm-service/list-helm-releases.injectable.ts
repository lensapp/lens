/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import listHelmReleasesInjectable from "../list-helm-releases.injectable";

const listClusterHelmReleasesInjectable = getInjectable({
  id: "list-cluster-helm-releases",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const listHelmReleases = di.inject(listHelmReleasesInjectable);

    return async (cluster: Cluster, namespace?: string) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug(`[CLUSTER]: listing helm releases for clusterId=${cluster.id}`, { namespace });

      return listHelmReleases(proxyKubeconfig, namespace);
    };
  },
});

export default listClusterHelmReleasesInjectable;
