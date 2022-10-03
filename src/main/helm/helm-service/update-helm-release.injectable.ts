/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/cluster/cluster";
import loggerInjectable from "../../../common/logger.injectable";
import type { JsonObject } from "type-fest";
import { execHelm } from "../exec";
import tempy from "tempy";
import fse from "fs-extra";
import yaml from "js-yaml";
import getHelmReleaseInjectable from "./get-helm-release.injectable";

export interface UpdateChartArgs {
  chart: string;
  values: JsonObject;
  version: string;
}

const updateHelmReleaseInjectable = getInjectable({
  id: "update-helm-release",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const getHelmRelease = di.inject(getHelmReleaseInjectable);

    return async (cluster: Cluster, releaseName: string, namespace: string, data: UpdateChartArgs) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      logger.debug("Upgrade release");

      const valuesFilePath = tempy.file({ name: "values.yaml" });

      await fse.writeFile(valuesFilePath, yaml.dump(data.values));

      const args = [
        "upgrade",
        releaseName,
        data.chart,
        "--version", data.version,
        "--values", valuesFilePath,
        "--namespace", namespace,
        "--kubeconfig", proxyKubeconfig,
      ];

      try {
        const output = await execHelm(args);

        return {
          log: output,
          release: await getHelmRelease(cluster, releaseName, namespace),
        };
      } finally {
        await fse.unlink(valuesFilePath);
      }
    };
  },

  causesSideEffects: true,
});

export default updateHelmReleaseInjectable;

