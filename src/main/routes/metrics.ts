import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import * as requestPromise from "request-promise-native"
import logger from "../logger"
import { PrometheusProviderFactory} from "../prometheus/provider"

type MetricsQuery = string | string[] | {
  [metricName: string]: string;
}

class MetricsRoute extends LensApi {

  public async routeMetrics(request: LensApiRequest) {
    const { response, cluster} = request
    const query: MetricsQuery = request.payload;
    const serverUrl = `http://127.0.0.1:${cluster.port}/api-kube`
    const metricsUrl = `${serverUrl}/api/v1/namespaces/${cluster.contextHandler.getPrometheusPath()}/proxy/api/v1/query_range`
    const headers = {
      "Host": `${cluster.id}.localhost:${cluster.port}`,
      "Content-type": "application/json",
    }
    const queryParams: MetricsQuery = {}
    request.query.forEach((value: string, key: string) => {
      queryParams[key] = value
    })

    const prometheusInstallationSource = cluster.preferences.prometheusSource || "lens"
    // prometheus metrics loader
    const attempts: { [query: string]: number } = {};
    const maxAttempts = 5;
    const loadMetrics = (orgQuery: string): Promise<any> => {
      logger.info(orgQuery)
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
        Object.entries(query).map((objectArr: any) => {
          const queryName = objectArr[0]
          const queryOpts = objectArr[1]
          logger.info(prometheusInstallationSource)
          const q = PrometheusProviderFactory.createProvider(prometheusInstallationSource).getQueries(queryOpts)[queryName]
          return loadMetrics(q)
        })
      );
      logger.info(JSON.stringify(result))
      Object.keys(query).forEach((metricName, index) => {
        data[metricName] = result[index];
      });
    }

    this.respondJson(response, data)
  }
}

export const metricsRoute = new MetricsRoute()
