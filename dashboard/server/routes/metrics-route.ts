//-- Metrics
// https://prometheus.io/docs/prometheus/latest/querying/api/

import { Router } from "express";
import config from "../config";
import { kubeRequest } from "../api/kube-request";
import { userSession } from "../user-session";
import { AxiosError } from "axios";
import { IMetrics } from "../../client/api/endpoints/metrics.api";
import { IMetricsQuery } from "../common/metrics"


export function metricsRoute() {
  const router = Router();

  router.post("/metrics", async (req, res, next) => {
    const { authHeader } = userSession.get(req);
    const { namespace, ...queryParams } = req.query;
    const query: IMetricsQuery = req.body;

    /*eslint-disable */
    // add default namespace for rbac-proxy validation
    if (!queryParams.kubernetes_namespace) {
      queryParams.kubernetes_namespace = config.STATS_NAMESPACE;
    }
    /*eslint-enble */

    // prometheus metrics loader
    const attempts: { [query: string]: number } = {};
    const maxAttempts = 5;
    const loadMetrics = (query: string): Promise<IMetrics> => {
      const attempt = attempts[query] = (attempts[query] || 0) + 1;
      return kubeRequest<IMetrics>({
        url: config.KUBE_METRICS_URL,
        path: "/api/v1/query_range",
        authHeader: authHeader,
        params: {
          query: query,
          ...queryParams,
        },
      }).catch(async (err: AxiosError) => {
        // https://github.com/axios/axios#handling-errors
        if (!err.response && attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // add delay before repeating request
          return loadMetrics(query);
        }
        return {
          status: err.toString(),
          data: {
            result: []
          },
        } as IMetrics;
      })
    };

    // return data in same structure as query
    let data: any;
    try {
      if (typeof query === "string") {
        data = await loadMetrics(query)
      }
      else if (Array.isArray(query)) {
        data = await Promise.all(query.map(loadMetrics));
      }
      else {
        data = {};
        const result = await Promise.all(
          Object.values(query).map(loadMetrics)
        );
        Object.keys(query).forEach((metricName, index) => {
          data[metricName] = result[index];
        });
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
