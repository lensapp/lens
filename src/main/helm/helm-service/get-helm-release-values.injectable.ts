/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getValues } from "../helm-release-manager";
import loggerInjectable from "../../../common/logger.injectable";
import type { Cluster } from "../../../common/cluster/cluster";

interface GetReleaseValuesArgs {
  cluster: Cluster;
  namespace: string;
  all: boolean;
}

const getHelmReleaseValuesInjectable = getInjectable({
  id: "get-helm-release-values",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return async (
      releaseName: string,
      { cluster, namespace, all }: GetReleaseValuesArgs,
    ) => {
      const pathToKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("Fetch release values");

      return getValues(releaseName, {
        namespace,
        all,
        kubeconfigPath: pathToKubeconfig,
      });
    };
  },

  causesSideEffects: true,
});

export default getHelmReleaseValuesInjectable;
