/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Metrics api

import moment from "moment";
import { apiBase } from "../index";
import type { IMetricsQuery } from "../../../main/routes/metrics/metrics-query";

export interface MetricData {
  status: string;
  data: {
    resultType: string;
    result: MetricResult[];
  };
}

export interface MetricResult {
  metric: {
    [name: string]: string | undefined;
    instance?: string;
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

export interface IResourceMetrics<T extends MetricData> {
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
  async getMetrics<T = IMetricsQuery>(query: T, reqParams: IMetricsReqParams = {}): Promise<T extends object ? { [K in keyof T]: MetricData } : MetricData> {
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

export function normalizeMetrics(metrics: MetricData | undefined | null, frames = 60): MetricData {
  if (!metrics?.data?.result) {
    return {
      data: {
        resultType: "",
        result: [{
          metric: {},
          values: [],
        }],
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
    } as MetricResult);
  }

  return metrics;
}

export function isMetricsEmpty(metrics: Partial<Record<string, MetricData>>) {
  return Object.values(metrics).every(metric => !metric?.data?.result?.length);
}

export function getItemMetrics(metrics: Partial<Record<string, MetricData>> | null | undefined, itemName: string): Partial<Record<string, MetricData>> | undefined {
  if (!metrics) {
    return undefined;
  }

  const itemMetrics = { ...metrics };

  for (const metric in metrics) {
    if (!metrics[metric]?.data?.result) {
      continue;
    }
    const results = metrics[metric]?.data.result;
    const result = results?.find(res => Object.values(res.metric)[0] == itemName);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    itemMetrics[metric]!.data.result = result ? [result] : [];
  }

  return itemMetrics;
}

export function getMetricLastPoints<T extends Partial<Record<string, MetricData>>>(metrics: T): Record<keyof T, number> {
  const result: Partial<{ [metric: string]: number }> = {};

  Object.keys(metrics).forEach(metricName => {
    try {
      const metric = metrics[metricName];

      if (metric?.data.result.length) {
        result[metricName] = +metric.data.result[0].values.slice(-1)[0][1];
      }
    } catch {
      // ignore error
    }

    return result;
  }, {});

  return result as Record<keyof T, number>;
}
