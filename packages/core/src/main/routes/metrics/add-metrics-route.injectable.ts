/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/router.injectable";
import type { ClusterPrometheusMetadata } from "../../../common/cluster-types";
import { ClusterMetadataKey } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";
import { clusterRoute } from "../../router/route";
import { isObject } from "lodash";
import { isRequestError, object } from "@k8slens/utilities";
import type { GetMetrics } from "../../get-metrics.injectable";
import getMetricsInjectable from "../../get-metrics.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import prometheusHandlerInjectable from "../../cluster/prometheus-handler/prometheus-handler.injectable";
import { runInAction } from "mobx";

// This is used for backoff retry tracking.
const ATTEMPTS = [false, false, false, false, true];

const loadMetricsFor = (getMetrics: GetMetrics) => async (promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Partial<Record<string, string>>): Promise<any[]> => {
  const queries = promQueries.map(p => p.trim());
  const loaders = new Map<string, Promise<any>>();

  async function loadMetric(query: string): Promise<any> {
    async function loadMetricHelper(): Promise<any> {
      for (const [attempt, lastAttempt] of ATTEMPTS.entries()) { // retry
        try {
          return await getMetrics(cluster, prometheusPath, { query, ...queryParams });
        } catch (error) {
          if (
            !isRequestError(error)
            || lastAttempt
            || (
              !lastAttempt && (
                typeof error.statusCode === "number" &&
                400 <= error.statusCode && error.statusCode < 500
              )
            )
          ) {
            throw new Error("Metrics not available", { cause: error });
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

  instantiate: (di) => {
    const getMetrics = di.inject(getMetricsInjectable);
    const loadMetrics = loadMetricsFor(getMetrics);
    const logger = di.inject(loggerInjectionToken);

    return clusterRoute({
      method: "post",
      path: `${apiPrefix}/metrics`,
    })(async ({ cluster, payload, query }) => {
      const queryParams: Partial<Record<string, string>> = Object.fromEntries(query.entries());
      const prometheusMetadata: ClusterPrometheusMetadata = {};
      const prometheusHandler = di.inject(prometheusHandlerInjectable, cluster);

      try {
        const { prometheusPath, provider } = await prometheusHandler.getPrometheusDetails();

        prometheusMetadata.provider = provider?.kind;
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
          const data = payload as Record<string, Record<string, string>>;
          const queries = object.entries(data)
            .map(([queryName, queryOpts]) => (
              provider.getQuery(queryOpts, queryName)
            ));

          const result = await loadMetrics(queries, cluster, prometheusPath, queryParams);
          const response = object.fromEntries(object.keys(data).map((metricName, i) => [metricName, result[i]]));

          prometheusMetadata.success = true;

          return { response };
        }

        return { response: {}};
      } catch (error) {
        prometheusMetadata.success = false;

        logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, error);

        return { response: {}};
      } finally {
        runInAction(() => {
          cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;
        });
      }
    });
  },
});

export default addMetricsRouteInjectable;
