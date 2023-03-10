/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import kubeconfigManagerInjectable from "../../kubeconfig-manager/kubeconfig-manager.injectable";
import listHelmReleasesInjectable from "../list-helm-releases.injectable";

const listClusterHelmReleasesInjectable = getInjectable({
  id: "list-cluster-helm-releases",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const listHelmReleases = di.inject(listHelmReleasesInjectable);

    return async (cluster: Cluster, namespace?: string) => {
      const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);
      const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();

      logger.debug(`[CLUSTER]: listing helm releases for clusterId=${cluster.id}`, { namespace });

      return listHelmReleases(proxyKubeconfigPath, namespace);
    };
  },
});

export default listClusterHelmReleasesInjectable;
