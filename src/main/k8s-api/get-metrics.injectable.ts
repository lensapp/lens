/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { RequestPromiseOptions } from "request-promise-native";
import type { Cluster } from "../../common/cluster/cluster";
import type { IMetricsReqParams } from "../../common/k8s-api/endpoints/metrics.api";
import { bind } from "../../common/utils";
import k8sRequestInjectable from "./k8s-request.injectable";

interface Dependencies {
  k8sRequest: (cluster: Cluster, path: string, options?: RequestPromiseOptions) => Promise<any>;
}

export interface GetMetricsReqParams extends IMetricsReqParams {
  query: string;
}

function getMetrics({ k8sRequest }: Dependencies, cluster: Cluster, prometheusPath: string, queryParams: GetMetricsReqParams): Promise<any> {
  const prometheusPrefix = cluster.preferences.prometheus?.prefix || "";
  const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;

  return k8sRequest(cluster, metricsPath, {
    timeout: 0,
    resolveWithFullResponse: false,
    json: true,
    method: "POST",
    form: queryParams,
  });
}

const getMetricsInjectable = getInjectable({
  instantiate: (di) => bind(getMetrics, null, {
    k8sRequest: di.inject(k8sRequestInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getMetricsInjectable;
