/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiKubePrefix } from "../common/vars";
import type { IMetricsReqParams } from "../common/k8s-api/endpoints/metrics.api";
import { LensProxy } from "./lens-proxy";
import type { Cluster } from "../common/cluster/cluster";
import got, { OptionsOfJSONResponseBody } from "got";

function getKubeProxyUrl() {
  return `http://localhost:${LensProxy.getInstance().port}${apiKubePrefix}`;
}

export async function k8sRequest<T = any>(cluster: Cluster, path: string, options: OptionsOfJSONResponseBody = {}): Promise<T> {
  const kubeProxyUrl = getKubeProxyUrl();

  options.timeout ??= 30000;
  options.headers ??= {};
  options.headers.Host = `${cluster.id}.${new URL(kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()
  options.responseType = "json";

  const { body } = await got<T>(kubeProxyUrl + path, options);

  return body;
}

export async function getMetrics(cluster: Cluster, prometheusPath: string, queryParams: IMetricsReqParams & { query: string }): Promise<any> {
  const prometheusPrefix = cluster.preferences.prometheus?.prefix || "";
  const kubeProxyUrl = getKubeProxyUrl();
  const url = `${kubeProxyUrl}/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;
  const { body } = await got.post<any>(url, {
    form: queryParams,
    headers: {
      Host: `${cluster.id}.${new URL(kubeProxyUrl).host}`,
    },
    responseType: "json",
  });

  return body;
}
