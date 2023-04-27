/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getSecondsFromUnixEpoch } from "../../../utils/date/get-current-date-time";
import apiBaseInjectable from "../../api-base.injectable";
import type { MetricData } from "../metrics.api";

export interface RequestMetricsParams {
  /**
   * timestamp in seconds or valid date-string
   */
  start?: number | string;

  /**
   * timestamp in seconds or valid date-string
   */
  end?: number | string;

  /**
   * step in seconds
   * @default 60 (1 minute)
   */
  step?: number;

  /**
   * time-range in seconds for data aggregation
   * @default 3600 (1 hour)
   */
  range?: number;

  /**
   * rbac-proxy validation param
   */
  namespace?: string;
}

export type RequestMetrics = ReturnType<typeof requestMetricsInjectable["instantiate"]>;

const requestMetricsInjectable = getInjectable({
  id: "request-metrics",
  instantiate: (di) => {
    const apiBase = di.inject(apiBaseInjectable);

    function requestMetrics(query: string, params?: RequestMetricsParams): Promise<MetricData>;
    function requestMetrics(query: string[], params?: RequestMetricsParams): Promise<MetricData[]>;
    function requestMetrics<Keys extends string>(query: Record<Keys, Partial<Record<string, string>>>, params?: RequestMetricsParams): Promise<Record<Keys, MetricData>>;
    async function requestMetrics(query: string | string[] | Partial<Record<string, Partial<Record<string, string>>>>, params: RequestMetricsParams = {}): Promise<MetricData | MetricData[] | Partial<Record<string, MetricData>>> {
      const { range = 3600, step = 60, namespace } = params;
      let { start, end } = params;

      if (!start && !end) {
        const now = getSecondsFromUnixEpoch();

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
    }

    return requestMetrics;
  },
});

export default requestMetricsInjectable;
