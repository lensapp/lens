/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { loggerInjectionToken } from "@k8slens/logger";
import kubeconfigManagerInjectable from "../../kubeconfig-manager/kubeconfig-manager.injectable";
import type { RollbackHelmReleaseData } from "../rollback-helm-release.injectable";
import rollbackHelmReleaseInjectable from "../rollback-helm-release.injectable";

const rollbackClusterHelmReleaseInjectable = getInjectable({
  id: "rollback-cluster-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectionToken);
    const rollbackHelmRelease = di.inject(rollbackHelmReleaseInjectable);

    return async (cluster: Cluster, data: RollbackHelmReleaseData) => {
      const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);
      const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();

      logger.debug(`[CLUSTER]: rolling back helm release for clusterId=${cluster.id}`, data);

      await rollbackHelmRelease(proxyKubeconfigPath, data);
    };
  },
});

export default rollbackClusterHelmReleaseInjectable;
