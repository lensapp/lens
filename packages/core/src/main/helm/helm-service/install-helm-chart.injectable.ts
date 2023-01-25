/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonObject } from "type-fest";
import type { Cluster } from "../../../common/cluster/cluster";
import installHelmChartInjectable from "../install-helm-chart.injectable";

export interface InstallChartArgs {
  chart: string;
  values: JsonObject;
  name: string;
  namespace: string;
  version: string;
}

const installClusterHelmChartInjectable = getInjectable({
  id: "install-cluster-helm-chart",

  instantiate: (di) => {
    const installHelmChart = di.inject(installHelmChartInjectable);

    return async (cluster: Cluster, data: InstallChartArgs) => {
      const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

      return installHelmChart({
        ...data,
        kubeconfigPath: proxyKubeconfig,
      });
    };
  },
});

export default installClusterHelmChartInjectable;
