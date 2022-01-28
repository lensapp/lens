/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../../router/router";
import { respondJson } from "../../utils/http-responses";
import type { Cluster } from "../../../common/cluster/cluster";
import { ClusterMetadataKey, ClusterPrometheusMetadata } from "../../../common/cluster-types";
import logger from "../../logger";
import { PrometheusProviderRegistry } from "../../prometheus";

export type IMetricsQuery = string | string[] | {
  [metricName: string]: string;
};

interface MetricProviderInfo {
  name: string;
  id: string;
  isConfigurable: boolean;
}

export interface MetricsRouteDependencies {
  loadMetrics: (promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Record<string, string>) => Promise<any[]>;
}

export class MetricsRoute {
  constructor(protected readonly dependencies: MetricsRouteDependencies) {}

  routeMetrics = async ({ response, cluster, payload, query }: LensApiRequest) => {
    const queryParams: IMetricsQuery = Object.fromEntries(query.entries());
    const prometheusMetadata: ClusterPrometheusMetadata = {};

    try {
      const { prometheusPath, provider } = await cluster.contextHandler.getPrometheusDetails();

      prometheusMetadata.provider = provider?.id;
      prometheusMetadata.autoDetected = !cluster.preferences.prometheusProvider?.type;

      if (!prometheusPath) {
        prometheusMetadata.success = false;

        return respondJson(response, {});
      }

      // return data in same structure as query
      if (typeof payload === "string") {
        const [data] = await this.dependencies.loadMetrics([payload], cluster, prometheusPath, queryParams);

        respondJson(response, data);
      } else if (Array.isArray(payload)) {
        const data = await this.dependencies.loadMetrics(payload, cluster, prometheusPath, queryParams);

        respondJson(response, data);
      } else {
        const queries = Object.entries<Record<string, string>>(payload)
          .map(([queryName, queryOpts]) => (
            provider.getQuery(queryOpts, queryName)
          ));
        const result = await this.dependencies.loadMetrics(queries, cluster, prometheusPath, queryParams);
        const data = Object.fromEntries(Object.keys(payload).map((metricName, i) => [metricName, result[i]]));

        respondJson(response, data);
      }
      prometheusMetadata.success = true;
    } catch (error) {
      prometheusMetadata.success = false;
      respondJson(response, {});
      logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, error);
    } finally {
      cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;
    }
  };

  routeMetricsProviders = ({ response }: LensApiRequest) => {
    const providers: MetricProviderInfo[] = [];

    for (const { name, id, isConfigurable } of PrometheusProviderRegistry.getInstance().providers.values()) {
      providers.push({ name, id, isConfigurable });
    }

    respondJson(response, providers);
  };
}
