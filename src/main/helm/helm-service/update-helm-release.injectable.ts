/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { upgradeRelease } from "../helm-release-manager";
import loggerInjectable from "../../../common/logger.injectable";
import type { JsonObject } from "type-fest";

export interface UpdateChartArgs {
  chart: string;
  values: JsonObject;
  version: string;
}

const updateHelmReleaseInjectable = getInjectable({
  id: "update-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string, data: UpdateChartArgs) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();
      const kubectl = await cluster.ensureKubectl();
      const kubectlPath = await kubectl.getPath();

      logger.debug("Upgrade release");

      return upgradeRelease(
        releaseName,
        data.chart,
        data.values,
        namespace,
        data.version,
        proxyKubeconfig,
        kubectlPath,
      );
    };
  },

  causesSideEffects: true,
});

export default updateHelmReleaseInjectable;
