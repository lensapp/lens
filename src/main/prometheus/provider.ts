import { PrometheusHelm } from "./helm"
import { PrometheusLens } from "./lens"
import { PrometheusOperator } from "./operator";

export type PrometheusQuery = {
  [key: string]: string;
}

export type PrometheusQueryOpts = {
  [key: string]: string | any;
};

export interface PrometheusProvider {
  getQueries(opts: PrometheusQueryOpts): PrometheusQuery;
}

export class PrometheusProviderFactory {
  static createProvider(type: string): PrometheusProvider {
    if (type == "lens") {
      return new PrometheusLens()
    } else if (type == "helm") {
      return new PrometheusHelm()
    } else if (type == "operator") {
      return new PrometheusOperator()
    } else {
      throw "Unknown Prometheus provider";
    }
  }
}