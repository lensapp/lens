export type PrometheusQuery = {
  [key: string]: string;
}

export type PrometheusQueryOpts = {
  [key: string]: string | any;
};

export interface PrometheusProvider {
  getQueries(opts: PrometheusQueryOpts): PrometheusQuery;
}

export class PrometheusProviderRegistry {
  private static prometheusProviders: {
    [key: string]: PrometheusProvider;
  } = {}

  static getProvider(type: string): PrometheusProvider {
    if (!this.prometheusProviders[type]) {
      throw "Unknown Prometheus provider";
    }
    return this.prometheusProviders[type]
  }

  static registerProvider(key: string, provider: PrometheusProvider) {
    this.prometheusProviders[key] = provider
  }
}