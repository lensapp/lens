/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { getRelease } from "../helm-release-manager";
import loggerInjectable from "../../../common/logger.injectable";

const getHelmReleaseInjectable = getInjectable({
  id: "get-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string) => {
      const kubeconfigPath = await cluster.getProxyKubeconfigPath();
      const kubectl = await cluster.ensureKubectl();
      const kubectlPath = await kubectl.getPath();

      logger.debug("Fetch release");

      return getRelease(releaseName, namespace, kubeconfigPath, kubectlPath);
    };
  },

  causesSideEffects: true,
});

export default getHelmReleaseInjectable;
