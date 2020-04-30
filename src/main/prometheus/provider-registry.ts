export type PrometheusQuery = {
  [key: string]: string;
}

export type PrometheusQueryOpts = {
  [key: string]: string | any;
};

export interface PrometheusProvider {
  getQueries(opts: PrometheusQueryOpts): PrometheusQuery;
}

export type PrometheusProviderList = {
  [key: string]: PrometheusProvider;
}

export class PrometheusProviderRegistry {
  private static prometheusProviders: PrometheusProviderList = {}

  static getProvider(type: string): PrometheusProvider {
    if (!this.prometheusProviders[type]) {
      throw "Unknown Prometheus provider";
    }
    return this.prometheusProviders[type]
  }

  static registerProvider(key: string, provider: PrometheusProvider) {
    this.prometheusProviders[key] = provider
  }

  static getProviders(): PrometheusProvider[] {
    return Object.values(this.prometheusProviders)
  }
}