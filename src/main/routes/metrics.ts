import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import * as requestPromise from "request-promise-native"
import { PrometheusProviderRegistry, PrometheusProvider, PrometheusNodeQuery, PrometheusClusterQuery, PrometheusPodQuery, PrometheusPvcQuery, PrometheusIngressQuery, PrometheusQueryOpts} from "../prometheus/provider-registry"

type MetricsQuery = string | string[] | {
  [metricName: string]: string;
}

class MetricsRoute extends LensApi {

  public async routeMetrics(request: LensApiRequest) {
    const { response, cluster} = request
    const query: MetricsQuery = request.payload;
    const serverUrl = `http://127.0.0.1:${cluster.port}/api-kube`
    const headers = {
      "Host": `${cluster.id}.localhost:${cluster.port}`,
      "Content-type": "application/json",
    }
    const queryParams: MetricsQuery = {}
    request.query.forEach((value: string, key: string) => {
      queryParams[key] = value
    })

    let metricsUrl: string
    let prometheusProvider: PrometheusProvider
    try {
      const prometheusPath = await cluster.contextHandler.getPrometheusPath()
      metricsUrl = `${serverUrl}/api/v1/namespaces/${prometheusPath}/proxy/api/v1/query_range`
      prometheusProvider = await cluster.contextHandler.getPrometheusProvider()
    } catch {
      this.respondJson(response, {})
      return
    }
    // prometheus metrics loader
    const attempts: { [query: string]: number } = {};
    const maxAttempts = 5;
    const loadMetrics = (orgQuery: string): Promise<any> => {
      const query = orgQuery.trim()
      const attempt = attempts[query] = (attempts[query] || 0) + 1;
      return requestPromise(metricsUrl, {
        resolveWithFullResponse: false,
        headers: headers,
        json: true,
        qs: {
          query: query,
          ...queryParams
        }
      }).catch(async (error) => {
        if (attempt < maxAttempts && (error.statusCode && error.statusCode != 404)) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // add delay before repeating request
          return loadMetrics(query);
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
    if (typeof query === "string") {
      data = await loadMetrics(query)
    }
    else if (Array.isArray(query)) {
      data = await Promise.all(query.map(loadMetrics));
    }
    else {
      data = {};
      const result = await Promise.all(
        Object.entries(query).map((queryEntry: any) => {
          const queryName: string = queryEntry[0]
          const queryOpts: PrometheusQueryOpts = queryEntry[1]
          const queries = prometheusProvider.getQueries(queryOpts)
          const q = queries[queryName as keyof (PrometheusNodeQuery | PrometheusClusterQuery | PrometheusPodQuery | PrometheusPvcQuery | PrometheusIngressQuery)]
          return loadMetrics(q)
        })
      );
      Object.keys(query).forEach((metricName, index) => {
        data[metricName] = result[index];
      });
    }

    this.respondJson(response, data)
  }
}

export const metricsRoute = new MetricsRoute()
