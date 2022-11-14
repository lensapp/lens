/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import FormData from "form-data";
import type { Cluster } from "../common/cluster/cluster";
import { withTimeout } from "../common/fetch/timeout-controller";
import type { RequestMetricsParams } from "../common/k8s-api/endpoints/metrics.api/request-metrics.injectable";
import k8sRequestInjectable from "./k8s-request.injectable";

export type GetMetrics = (cluster: Cluster, prometheusPath: string, queryParams: RequestMetricsParams & { query: string }) => Promise<any>;

const getMetricsInjectable = getInjectable({
  id: "get-metrics",

  instantiate: (di): GetMetrics => {
    const k8sRequest = di.inject(k8sRequestInjectable);

    return async (
      cluster,
      prometheusPath,
      queryParams,
    ) => {
      const prometheusPrefix = cluster.preferences.prometheus?.prefix || "";
      const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;
      const body = new FormData();

      for (const [key, value] of Object.entries(queryParams)) {
        body.append(key, value);
      }

      const controller = withTimeout(60 * 1000); // 1 minute timeout

      return k8sRequest(cluster, metricsPath, {
        signal: controller.signal,
        method: "POST",
        body,
      });
    };
  },
});

export default getMetricsInjectable;
