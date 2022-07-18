/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import type { ClusterPrometheusMetadata } from "../../../common/cluster-types";
import { ClusterMetadataKey } from "../../../common/cluster-types";
import logger from "../../logger";
import type { Cluster } from "../../../common/cluster/cluster";
import type { IMetricsQuery } from "./metrics-query";
import { clusterRoute } from "../../router/route";
import { isObject } from "lodash";
import { isRequestError } from "../../../common/utils";
import type { GetMetrics } from "../../get-metrics.injectable";
import getMetricsInjectable from "../../get-metrics.injectable";

// This is used for backoff retry tracking.
const ATTEMPTS = [false, false, false, false, true];

const loadMetricsFor = (getMetrics: GetMetrics) => async (promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Record<string, string>): Promise<any[]> => {
  const queries = promQueries.map(p => p.trim());
  const loaders = new Map<string, Promise<any>>();

  async function loadMetric(query: string): Promise<any> {
    async function loadMetricHelper(): Promise<any> {
      for (const [attempt, lastAttempt] of ATTEMPTS.entries()) { // retry
        try {
          return await getMetrics(cluster, prometheusPath, { query, ...queryParams });
        } catch (error) {
          if (isRequestError(error)) {
            if (lastAttempt || (error.statusCode && error.statusCode >= 400 && error.statusCode < 500)) {
              throw new Error("Metrics not available", { cause: error });
            }
          } else if (error instanceof Error) {
            throw new Error("Metrics not available", { cause: error });
          } else {
            throw new Error("Metrics not available");
          }

          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000)); // add delay before repeating request
        }
      }
    }

    return loaders.get(query) ?? loaders.set(query, loadMetricHelper()).get(query);
  }

  return Promise.all(queries.map(loadMetric));
};

const addMetricsRouteInjectable = getRouteInjectable({
  id: "add-metrics-route",

  instantiate: (di) => clusterRoute({
    method: "post",
    path: `${apiPrefix}/metrics`,
  })(async ({ cluster, payload, query }) => {
    const getMetrics = di.inject(getMetricsInjectable);
    const loadMetrics = loadMetricsFor(getMetrics);

    const queryParams: IMetricsQuery = Object.fromEntries(query.entries());
    const prometheusMetadata: ClusterPrometheusMetadata = {};

    try {
      const { prometheusPath, provider } = await cluster.contextHandler.getPrometheusDetails();

      prometheusMetadata.provider = provider?.id;
      prometheusMetadata.autoDetected = !cluster.preferences.prometheusProvider?.type;

      if (!prometheusPath) {
        prometheusMetadata.success = false;

        return { response: {}};
      }

      // return data in same structure as query
      if (typeof payload === "string") {
        const [data] = await loadMetrics([payload], cluster, prometheusPath, queryParams);

        return { response: data };
      }

      if (Array.isArray(payload)) {
        const data = await loadMetrics(payload, cluster, prometheusPath, queryParams);

        return { response: data };
      }

      if (isObject(payload)) {
        const queries = Object.entries(payload as Record<string, Record<string, string>>)
          .map(([queryName, queryOpts]) => (
            provider.getQuery(queryOpts, queryName)
          ));

        const result = await loadMetrics(queries, cluster, prometheusPath, queryParams);
        const data = Object.fromEntries(Object.keys(payload).map((metricName, i) => [metricName, result[i]]));

        prometheusMetadata.success = true;

        return { response: data };
      }

      return { response: {}};
    } catch (error) {
      prometheusMetadata.success = false;

      logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, error);

      return { response: {}};
    } finally {
      cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;
    }
  }),
});

export default addMetricsRouteInjectable;
