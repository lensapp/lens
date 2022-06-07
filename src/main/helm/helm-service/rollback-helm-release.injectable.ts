/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import { rollback } from "../helm-release-manager";

const rollbackHelmReleaseInjectable = getInjectable({
  id: "rollback-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (
      cluster: Cluster,
      releaseName: string,
      namespace: string,
      revision: number,
    ) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("Rollback release");
      await rollback(releaseName, namespace, revision, proxyKubeconfig);
    };
  },

  causesSideEffects: true,
});

export default rollbackHelmReleaseInjectable;
