import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import requestPromise from "request-promise-native"
import { PrometheusClusterQuery, PrometheusIngressQuery, PrometheusNodeQuery, PrometheusPodQuery, PrometheusProvider, PrometheusPvcQuery, PrometheusQueryOpts } from "../prometheus/provider-registry"

export type IMetricsQuery = string | string[] | {
  [metricName: string]: string;
}

class MetricsRoute extends LensApi {
  public async routeMetrics(request: LensApiRequest<IMetricsQuery>) {
    const { response, cluster, payload } = request
    const { contextHandler, kubeProxyUrl } = cluster;
    let metricsUrl: string
    let prometheusProvider: PrometheusProvider
    try {
      const prometheusPath = await contextHandler.getPrometheusPath()
      metricsUrl = `${kubeProxyUrl}/api/v1/namespaces/${prometheusPath}/proxy${cluster.getPrometheusApiPrefix()}/api/v1/query_range`
      prometheusProvider = await contextHandler.getPrometheusProvider()
    } catch {
      this.respondJson(response, {})
      return
    }
    // prometheus metrics loader
    const attempts: Record<string, number> = {};
    const maxAttempts = 5;
    const loadMetrics = (promQuery: string): Promise<any> => {
      const queryString = request.query.toString() + `&query=` + promQuery;
      const attempt = attempts[queryString] = (attempts[queryString] || 0) + 1;
      return requestPromise(metricsUrl, {
        json: true,
        qs: queryString,
        useQuerystring: true,
        resolveWithFullResponse: false,
      }).catch(async (error) => {
        if (attempt < maxAttempts && (error.statusCode && error.statusCode != 404)) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // add delay before repeating request
          return loadMetrics(queryString);
        }
        return {
          status: error.toString(),
          data: {
            result: []
          }
        }
      })
    };

    // return data in same structure as query
    let data: any;
    if (typeof payload === "string") {
      data = await loadMetrics(payload)
    } else if (Array.isArray(payload)) {
      data = await Promise.all(payload.map(loadMetrics));
    } else {
      data = {};
      const result = await Promise.all(
        Object.entries(payload).map((queryEntry: any) => {
          const queryName: string = queryEntry[0]
          const queryOpts: PrometheusQueryOpts = queryEntry[1]
          const queries = prometheusProvider.getQueries(queryOpts)
          const q = queries[queryName as keyof (PrometheusNodeQuery | PrometheusClusterQuery | PrometheusPodQuery | PrometheusPvcQuery | PrometheusIngressQuery)]
          return loadMetrics(q)
        })
      );
      Object.keys(payload).forEach((metricName, index) => {
        data[metricName] = result[index];
      });
    }

    this.respondJson(response, data)
  }
}

export const metricsRoute = new MetricsRoute()
