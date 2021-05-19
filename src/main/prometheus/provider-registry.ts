/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { CoreV1Api } from "@kubernetes/client-node";

export type PrometheusClusterQuery = {
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
};

export type PrometheusNodeQuery = {
  memoryUsage: string;
  memoryCapacity: string;
  cpuUsage: string;
  cpuCapacity: string;
  fsSize: string;
  fsUsage: string;
};

export type PrometheusPodQuery = {
  memoryUsage: string;
  memoryRequests: string;
  memoryLimits: string;
  cpuUsage: string;
  cpuRequests: string;
  cpuLimits: string;
  fsUsage: string;
  networkReceive: string;
  networkTransmit: string;
};

export type PrometheusPvcQuery = {
  diskUsage: string;
  diskCapacity: string;
};

export type PrometheusIngressQuery = {
  bytesSentSuccess: string;
  bytesSentFailure: string;
  requestDurationSeconds: string;
  responseDurationSeconds: string;
};

export type PrometheusQueryOpts = {
  [key: string]: string | any;
};

export type PrometheusQuery = PrometheusNodeQuery | PrometheusClusterQuery | PrometheusPodQuery | PrometheusPvcQuery | PrometheusIngressQuery;

export type PrometheusService = {
  id: string;
  namespace: string;
  service: string;
  port: number;
};

export interface PrometheusProvider {
  id: string;
  name: string;
  getQueries(opts: PrometheusQueryOpts): PrometheusQuery | void;
  getPrometheusService(client: CoreV1Api): Promise<PrometheusService | void>;
}

export type PrometheusProviderList = {
  [key: string]: PrometheusProvider;
};

export class PrometheusProviderRegistry {
  private static prometheusProviders: PrometheusProviderList = {};

  static getProvider(type: string): PrometheusProvider {
    if (!this.prometheusProviders[type]) {
      throw "Unknown Prometheus provider";
    }

    return this.prometheusProviders[type];
  }

  static registerProvider(key: string, provider: PrometheusProvider) {
    this.prometheusProviders[key] = provider;
  }

  static getProviders(): PrometheusProvider[] {
    return Object.values(this.prometheusProviders);
  }
}
