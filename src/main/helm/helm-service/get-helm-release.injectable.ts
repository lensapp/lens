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
      const kubectl = await cluster.ensureKubectl();
      const kubectlPath = await kubectl.getPath();

      logger.debug("Fetch release");

      const args = [
        "status",
        releaseName,
        "--namespace",
        namespace,
        "--kubeconfig",
        kubeconfigPath,
        "--output",
        "json",
      ];

      const result = await execHelm(args);

      if (!result.callWasSuccessful) {
        return undefined;
      }

      const release = json.parse(result.response);

      if (!isObject(release) || Array.isArray(release)) {
        return undefined;
      }

      release.resources = await getHelmReleaseResources(
        releaseName,
        namespace,
        kubeconfigPath,
        kubectlPath,
      );

      return release;
    };
  },

  causesSideEffects: true,
});

export default getHelmReleaseInjectable;
