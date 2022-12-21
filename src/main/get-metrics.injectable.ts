/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../common/cluster/cluster";
import nodeFetchModuleInjectable from "../common/fetch/fetch-module.injectable";
import type { RequestMetricsParams } from "../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
import { object } from "../common/utils";
import k8sRequestInjectable from "./k8s-request.injectable";

export type GetMetrics = (cluster: Cluster, prometheusPath: string, queryParams: RequestMetricsParams & { query: string }) => Promise<unknown>;

const getMetricsInjectable = getInjectable({
  id: "get-metrics",

  instantiate: (di): GetMetrics => {
    const k8sRequest = di.inject(k8sRequestInjectable);
    const { FormData } = di.inject(nodeFetchModuleInjectable);

    return async (
      cluster,
      prometheusPath,
      queryParams,
    ) => {
      const prometheusPrefix = cluster.preferences.prometheus?.prefix || "";
      const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;
      const body = new FormData();

      for (const [key, value] of object.entries(queryParams)) {
        body.set(key, `${value}`);
      }

      return k8sRequest(cluster, metricsPath, {
        method: "POST",
        body,
      });
    };
  },
});

export default getMetricsInjectable;
