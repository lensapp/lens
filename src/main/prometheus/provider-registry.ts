import { CoreV1Api } from "@kubernetes/client-node";

export interface PrometheusClusterQuery {
  memoryUsage: string;
  memoryRequests: string;
  memoryLimits: string;
  memoryCapacity: string;
  cpuUsage: string;
  cpuRequests: string;
  cpuLimits: string;
  cpuCapacity: string;
  podUsage: string;
  podCapacity: string;
}

export interface PrometheusNodeQuery {
  memoryUsage: string;
  memoryCapacity: string;
  cpuUsage: string;
  cpuCapacity: string;
  fsSize: string;
  fsUsage: string;
}

export interface PrometheusPodQuery {
  memoryUsage: string;
  memoryRequests: string;
  memoryLimits: string;
  cpuUsage: string;
  cpuRequests: string;
  cpuLimits: string;
  fsUsage: string;
  networkReceive: string;
  networkTransmit: string;
}

export interface PrometheusPvcQuery {
  diskUsage: string;
  diskCapacity: string;
}

export interface PrometheusIngressQuery {
  bytesSentSuccess: string;
  bytesSentFailure: string;
  requestDurationSeconds: string;
  responseDurationSeconds: string;
}

export interface PrometheusQueryOpts {
  [key: string]: string | any;
}

export type PrometheusQuery = PrometheusNodeQuery | PrometheusClusterQuery | PrometheusPodQuery | PrometheusPvcQuery | PrometheusIngressQuery

export interface PrometheusService {
  id: string;
  namespace: string;
  service: string;
  port: number;
}

export interface PrometheusProvider {
  id: string;
  name: string;
  getQueries(opts: PrometheusQueryOpts): PrometheusQuery;
  getPrometheusService(client: CoreV1Api): Promise<PrometheusService>;
}

export interface PrometheusProviderList {
  [key: string]: PrometheusProvider;
}

export class PrometheusProviderRegistry {
  private static prometheusProviders: PrometheusProviderList = {}

  static getProvider(type: string): PrometheusProvider {
    if (!this.prometheusProviders[type]) {
      throw "Unknown Prometheus provider";
    }
    return this.prometheusProviders[type];
  }

  static registerProvider(key: string, provider: PrometheusProvider): void {
    this.prometheusProviders[key] = provider;
  }

  static getProviders(): PrometheusProvider[] {
    return Object.values(this.prometheusProviders);
  }
}
