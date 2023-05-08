/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import { loggerInjectionToken } from "@k8slens/logger";
import tempy from "tempy";
import getHelmReleaseInjectable from "./get-helm-release.injectable";
import writeFileInjectable from "../../../common/fs/write-file.injectable";
import removePathInjectable from "../../../common/fs/remove.injectable";
import execHelmInjectable from "../exec-helm/exec-helm.injectable";
import kubeconfigManagerInjectable from "../../kubeconfig-manager/kubeconfig-manager.injectable";

export interface UpdateChartArgs {
  chart: string;
  values: string;
  version: string;
}

const updateHelmReleaseInjectable = getInjectable({
  id: "update-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectionToken);
    const getHelmRelease = di.inject(getHelmReleaseInjectable);
    const writeFile = di.inject(writeFileInjectable);
    const removePath = di.inject(removePathInjectable);
    const execHelm = di.inject(execHelmInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string, data: UpdateChartArgs) => {
      const proxyKubeconfigManager = di.inject(kubeconfigManagerInjectable, cluster);
      const proxyKubeconfigPath = await proxyKubeconfigManager.ensurePath();
      const valuesFilePath = tempy.file({ name: "values.yaml" });

      logger.debug(`[HELM]: upgrading "${releaseName}" in "${namespace}" to ${data.version}`);

      try {
        await writeFile(valuesFilePath, data.values);

        const result = await execHelm([
          "upgrade",
          releaseName,
          data.chart,
          "--version", data.version,
          "--values", valuesFilePath,
          "--namespace", namespace,
          "--kubeconfig", proxyKubeconfigPath,
        ]);

        if (result.callWasSuccessful === false) {
          throw result.error; // keep the same interface
        }

        const releaseResult = await getHelmRelease({ cluster, releaseName, namespace });

        if (!releaseResult.callWasSuccessful) {
          throw releaseResult.error; // keep the same interface
        }

        return {
          log: result.response,
          release: releaseResult.response,
        };
      } finally {
        await removePath(valuesFilePath);
      }
    };
  },
});

export default updateHelmReleaseInjectable;

