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

export interface IMetricsReqParams {
  start?: number | string;        // timestamp in seconds or valid date-string
  end?: number | string;
  step?: number;                  // step in seconds (default: 60s = each point 1m)
  range?: number;                 // time-range in seconds for data aggregation (default: 3600s = last 1h)
  namespace?: string;             // rbac-proxy validation param
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
      }
    });
  },
};

export function normalizeMetrics(metrics: IMetrics, frames = 60): IMetrics {
  if (!metrics?.data?.result) {
    return {
      data: {
        resultType: "",
        result: [{
          metric: {},
          values: []
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
        while (res.values.length < frames) {
          const timestamp = moment.unix(res.values[0][0]).subtract(1, "minute").unix();
          res.values.unshift([timestamp, "0"]);
        }
      });
    }
  }
  else {
    // always return at least empty values array
    result.push({
      metric: {},
      values: []
    } as IMetricsResult);
  }

  return metrics;
}

export function isMetricsEmpty(metrics: { [key: string]: IMetrics }) {
  return Object.values(metrics).every(metric => !metric?.data?.result?.length);
}

export function getItemMetrics(metrics: { [key: string]: IMetrics }, itemName: string): { [key: string]: IMetrics } {
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

export function getMetricLastPoints(metrics: { [key: string]: IMetrics }) {
  const result: Partial<{ [metric: string]: number }> = {};

  Object.keys(metrics).forEach(metricName => {
    try {
      const metric = metrics[metricName];
      if (metric.data.result.length) {
        result[metricName] = +metric.data.result[0].values.slice(-1)[0][1];
      }
    } catch (e) {
    }
    return result;
  }, {});

  return result;
}
