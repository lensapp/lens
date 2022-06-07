/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonObject } from "type-fest";
import type { Cluster } from "../../../common/cluster/cluster";
import { installChart } from "../helm-release-manager";

export interface InstallChartArgs {
  chart: string;
  values: JsonObject;
  name: string;
  namespace: string;
  version: string;
}

const installHelmChartInjectable = getInjectable({
  id: "install-helm-chart",

  instantiate: () => async (cluster: Cluster, data: InstallChartArgs) => {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    return installChart(data.chart, data.values, data.name, data.namespace, data.version, proxyKubeconfig);
  },

  causesSideEffects: true,
});

export default installHelmChartInjectable;
