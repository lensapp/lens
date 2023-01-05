/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { deleteRelease } from "../helm-release-manager";
import loggerInjectable from "../../../common/logger.injectable";

const deleteHelmReleaseInjectable = getInjectable({
  id: "delete-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("Delete release");

      return deleteRelease(releaseName, namespace, proxyKubeconfig);
    };
  },

  causesSideEffects: true,
});

export default deleteHelmReleaseInjectable;
