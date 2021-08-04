/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import request, { RequestPromiseOptions } from "request-promise-native";
import { apiKubePrefix } from "../common/vars";
import type { IMetricsReqParams } from "../renderer/api/endpoints/metrics.api";
import { LensProxy } from "./lens-proxy";
import type { Cluster } from "./cluster";

export async function k8sRequest<T = any>(cluster: Cluster, path: string, options: RequestPromiseOptions = {}): Promise<T> {
  const kubeProxyUrl = `http://localhost:${LensProxy.getInstance().port}${apiKubePrefix}`;

  options.headers ??= {};
  options.json ??= true;
  options.timeout ??= 30000;
  options.headers.Host = `${cluster.id}.${new URL(kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()

  return request(kubeProxyUrl + path, options);
}

export async function getMetrics(cluster: Cluster, prometheusPath: string, queryParams: IMetricsReqParams & { query: string }): Promise<any> {
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
