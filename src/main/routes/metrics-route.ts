import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { Cluster, ClusterMetadataKey } from "../cluster";
import { ClusterPrometheusMetadata } from "../../common/cluster-store";
import { PrometheusQueryKey } from "../prometheus/provider-registry";
import logger from "../logger";

export interface MetricsQuery {
  [metricName: string]: string;
}

// prometheus metrics loader
async function loadMetrics(promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Record<string, string>): Promise<any[]> {
  const queries = promQueries.map(p => p.trim());
  const loaders = new Map<string, ReturnType<(typeof cluster)["getMetrics"]>>();

  async function loadMetric(query: string) {
    const searchParams = { query, ...queryParams };

    return loaders.get(query) ?? loaders.set(query, cluster.getMetrics(prometheusPath, searchParams)).get(query);
  }

  const responses = await Promise.all(queries.map(loadMetric));

  return responses.map(([, respJson]) => respJson);
}

export interface MetricsResult {
  status?: string;
  data?: any;
}

class MetricsRoute extends LensApi {
  async routeMetrics({ response, cluster, payload, query }: LensApiRequest) {
    const queryParams: MetricsQuery = Object.fromEntries(query.entries());
    const prometheusMetadata: ClusterPrometheusMetadata = {};

    try {
      const [prometheusPath, prometheusProvider] = await Promise.all([
        cluster.contextHandler.getPrometheusPath(),
        cluster.contextHandler.getPrometheusProvider()
      ]);

      prometheusMetadata.provider = prometheusProvider?.id;
      prometheusMetadata.autoDetected = !cluster.preferences.prometheusProvider?.type;

      if (!prometheusPath) {
        prometheusMetadata.success = false;
        this.respondJson(response, {});

        return;
      }

      // return data in same structure as query
      if (typeof payload === "string") {
        const [data] = await loadMetrics([payload], cluster, prometheusPath, queryParams);

        this.respondJson(response, data);
      } else if (Array.isArray(payload)) {
        const data = await loadMetrics(payload, cluster, prometheusPath, queryParams);

        this.respondJson(response, data);
      } else {
        const queries = Object.entries(payload).map(([queryName, queryOpts]) => (
          (prometheusProvider.getQueries(queryOpts) as Record<PrometheusQueryKey, string>)[queryName as PrometheusQueryKey]
        ));
        const result = await loadMetrics(queries, cluster, prometheusPath, queryParams);
        const data = Object.fromEntries(Object.keys(payload).map((metricName, i) => [metricName, result[i]]));

        this.respondJson(response, data);
      }
      prometheusMetadata.success = true;
    } catch (error) {
      logger.error(`[METRICS]: failed to load metrics: ${error}`, { error });

      prometheusMetadata.success = false;
      this.respondJson(response, {});
    } finally {
      cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;
    }
  }
}

export const metricsRoute = new MetricsRoute();
