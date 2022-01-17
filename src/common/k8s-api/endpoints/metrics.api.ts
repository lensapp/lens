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

// Metrics api

import moment from "moment";
import { apiBase } from "../index";
import type { IMetricsQuery } from "../../../main/routes/metrics-route";

export interface IMetrics {
  status: string;
  data: {
    resultType: string;
    result: IMetricsResult[];
  };
}

export interface IMetricsResult {
  metric: {
    [name: string]: string;
    instance: string;
    node?: string;
    pod?: string;
    kubernetes?: string;
    kubernetes_node?: string;
    kubernetes_namespace?: string;
  };
  values: [number, string][];
}

export interface MetricProviderInfo {
  name: string;
  id: string;
  isConfigurable: boolean;
}

export interface IMetricsReqParams {
  start?: number | string;        // timestamp in seconds or valid date-string
  end?: number | string;
  step?: number;                  // step in seconds (default: 60s = each point 1m)
  range?: number;                 // time-range in seconds for data aggregation (default: 3600s = last 1h)
  namespace?: string;             // rbac-proxy validation param
}

export interface IResourceMetrics<T extends IMetrics> {
  [metric: string]: T;
  cpuUsage: T;
  memoryUsage: T;
  fsUsage: T;
  fsWrites: T;
  fsReads: T;
  networkReceive: T;
  networkTransmit: T;
}

export const metricsApi = {
  async getMetrics<T = IMetricsQuery>(query: T, reqParams: IMetricsReqParams = {}): Promise<T extends object ? { [K in keyof T]: IMetrics } : IMetrics> {
    const { range = 3600, step = 60, namespace } = reqParams;
    let { start, end } = reqParams;

    if (!start && !end) {
      const timeNow = Date.now() / 1000;
      const now = moment.unix(timeNow).startOf("minute").unix();  // round date to minutes

      start = now - range;
      end = now;
    }

    return apiBase.post("/metrics", {
      data: query,
      query: {
        start, end, step,
        "kubernetes_namespace": namespace,
      },
    });
  },

  async getMetricProviders(): Promise<MetricProviderInfo[]> {
    return apiBase.get("/metrics/providers");
  },
};

export function normalizeMetrics(metrics: IMetrics, frames = 60): IMetrics {
  if (!metrics?.data?.result) {
    return {
      data: {
        resultType: "",
        result: [{
          metric: {},
          values: [],
        } as IMetricsResult],
      },
      status: "",
    };
  }

  const { result } = metrics.data;

  if (result.length) {
    if (frames > 0) {
      // fill the gaps
      result.forEach(res => {
        if (!res.values || !res.values.length) return;

        let now = moment().startOf("minute").subtract(1, "minute").unix();
        let timestamp = res.values[0][0];

        while (timestamp <= now) {
          timestamp = moment.unix(timestamp).add(1, "minute").unix();

          if (!res.values.find((value) => value[0] === timestamp)) {
            res.values.push([timestamp, "0"]);
          }
        }

        while (res.values.length < frames) {
          const timestamp = moment.unix(res.values[0][0]).subtract(1, "minute").unix();

          if (!res.values.find((value) => value[0] === timestamp)) {
            res.values.unshift([timestamp, "0"]);
          }
          now = timestamp;
        }
      });
    }
  }
  else {
    // always return at least empty values array
    result.push({
      metric: {},
      values: [],
    } as IMetricsResult);
  }

  return metrics;
}

export function isMetricsEmpty(metrics: Record<string, IMetrics>) {
  return Object.values(metrics).every(metric => !metric?.data?.result?.length);
}

export function getItemMetrics(metrics: Record<string, IMetrics>, itemName: string): Record<string, IMetrics> | void {
  if (!metrics) return;
  const itemMetrics = { ...metrics };

  for (const metric in metrics) {
    if (!metrics[metric]?.data?.result) {
      continue;
    }
    const results = metrics[metric].data.result;
    const result = results.find(res => Object.values(res.metric)[0] == itemName);

    itemMetrics[metric].data.result = result ? [result] : [];
  }

  return itemMetrics;
}

export function getMetricLastPoints(metrics: Record<string, IMetrics>) {
  const result: Partial<{ [metric: string]: number }> = {};

  Object.keys(metrics).forEach(metricName => {
    try {
      const metric = metrics[metricName];

      if (metric.data.result.length) {
        result[metricName] = +metric.data.result[0].values.slice(-1)[0][1];
      }
    } catch {
      // ignore error
    }

    return result;
  }, {});

  return result;
}
