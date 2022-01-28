/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../../common/cluster/cluster";
import type { GetMetricsReqParams } from "../../k8s-api/get-metrics.injectable";
import logger from "../../logger";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../common/utils";
import getMetricsInjectable from "../../k8s-api/get-metrics.injectable";

// This is used for backoff retry tracking.
const ATTEMPTS = [false, false, false, false, true];

interface Dependencies {
  getMetrics: (cluster: Cluster, prometheusPath: string, queryParams: GetMetricsReqParams) => Promise<any>;
}

// prometheus metrics loader
function loadMetrics({ getMetrics }: Dependencies, promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Record<string, string>): Promise<any[]> {
  const queries = promQueries.map(p => p.trim());
  const loaders = new Map<string, Promise<any>>();

  function loadMetric(query: string): Promise<any> {
    async function loadMetricHelper(): Promise<any> {
      for (const [attempt, lastAttempt] of ATTEMPTS.entries()) { // retry
        try {
          return await getMetrics(cluster, prometheusPath, { query, ...queryParams });
        } catch (error) {
          if (lastAttempt || (error?.statusCode >= 400 && error?.statusCode < 500)) {
            logger.error("[Metrics]: metrics not available", error?.response ? error.response?.body : error);
            throw new Error("Metrics not available");
          }

          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000)); // add delay before repeating request
        }
      }
    }

    return loaders.get(query) ?? loaders.set(query, loadMetricHelper()).get(query);
  }

  return Promise.all(queries.map(loadMetric));
}

const loadMetricsInjectable = getInjectable({
  instantiate: (di) => bind(loadMetrics, null, {
    getMetrics: di.inject(getMetricsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default loadMetricsInjectable;

