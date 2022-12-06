/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiPrefix } from "../../../common/vars";
import { getRouteInjectable } from "../../router/route-request.injectable";
import type { ClusterPrometheusMetadata } from "../../../common/cluster-types";
import { ClusterMetadataKey } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";
import { payloadValidatedClusterRoute } from "../../router/route";
import { getOrInsertWith, isRequestError, object } from "../../../common/utils";
import type { GetMetrics } from "../../get-metrics.injectable";
import getMetricsInjectable from "../../get-metrics.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { AsyncResult } from "../../../common/utils/async-result";
import Joi from "joi";

// This is used for backoff retry tracking.
const MAX_ATTEMPTS = 5;

const loadMetricsFor = (getMetrics: GetMetrics) => async (promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Partial<Record<string, string>>): Promise<AsyncResult<unknown[], Error>> => {
  const queries = promQueries.map(p => p.trim());
  const loaders = new Map<string, Promise<AsyncResult<unknown, Error>>>();

  async function loadMetric(query: string): Promise<AsyncResult<unknown, Error>> {
    async function loadMetricHelper(attempt: number): Promise<AsyncResult<unknown, Error>> {
      const lastAttempt = attempt === MAX_ATTEMPTS;

      try {
        return {
          callWasSuccessful: true,
          response: await getMetrics(cluster, prometheusPath, { query, ...queryParams }),
        };
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
          return {
            callWasSuccessful: false,
            error: new Error("Metrics not available", { cause: error }),
          };
        }

        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000)); // add delay before repeating request
      }

      return loadMetricHelper(attempt + 1);
    }

    return getOrInsertWith(loaders, query, () => loadMetricHelper(0));
  }

  const responses: unknown[] = [];

  for await (const result of queries.map(loadMetric)) {
    if (result.callWasSuccessful) {
      responses.push(result.response);
    } else {
      return result;
    }
  }

  return {
    callWasSuccessful: true,
    response: responses,
  };
};

type ClusterMetricsPayload = string | string[] | Partial<Record<string, Partial<Record<string, string>>>>;

const clusterMetricsPayloadValidator = Joi.alternatives<ClusterMetricsPayload>(
  Joi.string(),
  Joi.array().items(Joi.string()),
  Joi.object()
    .pattern(
      Joi.string(),
      Joi.object()
        .pattern(
          Joi.string(),
          Joi.string(),
        ),
    ),
);

const addMetricsRouteInjectable = getRouteInjectable({
  id: "add-metrics-route",

  instantiate: (di) => {
    const getMetrics = di.inject(getMetricsInjectable);
    const loadMetrics = loadMetricsFor(getMetrics);
    const logger = di.inject(loggerInjectable);

    return payloadValidatedClusterRoute({
      method: "post",
      path: `${apiPrefix}/metrics`,
      payloadValidator: clusterMetricsPayloadValidator,
    })(async ({ cluster, payload, query }) => {
      const queryParams: Partial<Record<string, string>> = Object.fromEntries(query.entries());
      const prometheusMetadata: ClusterPrometheusMetadata = {};

      const detailsResult = await cluster.contextHandler.getPrometheusDetails();

      if (!detailsResult.callWasSuccessful) {
        prometheusMetadata.success = false;
        cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;

        logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, detailsResult.error);

        return { response: {}};
      }

      const { provider, prometheusPath } = detailsResult.response;

      prometheusMetadata.provider = provider?.kind;
      prometheusMetadata.autoDetected = !cluster.preferences.prometheusProvider?.type;

      if (!prometheusPath) {
        prometheusMetadata.success = false;
        cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;

        return { response: {}};
      }

      prometheusMetadata.success = true;
      cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;

      // return data in same structure as query
      if (typeof payload === "string") {
        const result = await loadMetrics([payload], cluster, prometheusPath, queryParams);

        if (result.callWasSuccessful) {
          return { response: result.response[0] };
        }

        logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, result.error);

        return { response: {}};
      }

      if (Array.isArray(payload)) {
        const result = await loadMetrics(payload, cluster, prometheusPath, queryParams);

        if (result.callWasSuccessful) {
          return { response: result.response };
        }

        logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, result.error);

        return { response: {}};
      }

      // Last option
      const queries = object.entries(payload)
        .map(([queryName, queryOpts]) => (
          provider.getQuery(queryOpts, queryName)
        ));

      const result = await loadMetrics(queries, cluster, prometheusPath, queryParams);

      if (!result.callWasSuccessful) {
        logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, result.error);

        return { response: {}};
      }

      const response = object.fromEntries(object.keys(payload).map((metricName, i) => [metricName, result.response[i]]));

      return { response };
    });
  },
});

export default addMetricsRouteInjectable;
