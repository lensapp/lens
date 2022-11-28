/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import { isObject, json } from "../../../common/utils";
import execHelmInjectable from "../exec-helm/exec-helm.injectable";
import getHelmReleaseResourcesInjectable from "./get-helm-release-resources/get-helm-release-resources.injectable";

const getHelmReleaseInjectable = getInjectable({
  id: "get-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const execHelm = di.inject(execHelmInjectable);
    const getHelmReleaseResources = di.inject(getHelmReleaseResourcesInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string) => {
      const kubeconfigPath = await cluster.getProxyKubeconfigPath();

      logger.debug("Fetch release");

      const result = await execHelm([
        "status",
        releaseName,
        "--namespace",
        namespace,
        "--kubeconfig",
        kubeconfigPath,
        "--output",
        "json",
      ]);

      if (!result.callWasSuccessful) {
        logger.warn(`Failed to exectute helm: ${result.error}`);

        return undefined;
      }

      const release = json.parse(result.response);

      if (!isObject(release) || Array.isArray(release)) {
        return undefined;
      }

      const resourcesResult = await getHelmReleaseResources(
        releaseName,
        namespace,
        kubeconfigPath,
      );

      if (!resourcesResult.callWasSuccessful) {
        logger.warn(`Failed to get helm release resources: ${resourcesResult.error}`);

        return undefined;
      }

      return {
        ...release,
        resources: resourcesResult.response,
      };
    };
  },

  causesSideEffects: true,
});

export default getHelmReleaseInjectable;
