/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import { listReleases } from "../helm-release-manager";

const listHelmReleasesInjectable = getInjectable({
  id: "list-helm-releases",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (cluster: Cluster, namespace?: string) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("list releases");

      return listReleases(proxyKubeconfig, namespace);
    };
  },

  causesSideEffects: true,
});

export default listHelmReleasesInjectable;
