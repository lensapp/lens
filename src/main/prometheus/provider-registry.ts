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
import { Singleton } from "../../common/utils";
import logger from "../logger";

export type PrometheusService = {
  id: string;
  namespace: string;
  service: string;
  port: number;
};

export abstract class PrometheusProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly rateAccuracy: string;
  abstract readonly isConfigurable: boolean;

  abstract getQuery(opts: Record<string, string>, queryName: string): string;
  abstract getPrometheusService(client: CoreV1Api): Promise<PrometheusService | undefined>;

  protected bytesSent(ingress: string, namespace: string, statuses: string): string {
    return `sum(rate(nginx_ingress_controller_bytes_sent_sum{ingress="${ingress}",namespace="${namespace}",status=~"${statuses}"}[${this.rateAccuracy}])) by (ingress, namespace)`;
  }

  protected async getFirstNamespacedServer(client: CoreV1Api, ...selectors: string[]): Promise<PrometheusService | undefined> {
    try {
      for (const selector of selectors) {
        const { body: { items: [service] }} = await client.listServiceForAllNamespaces(null, null, null, selector);

        if (service) {
          return {
            id: this.id,
            namespace: service.metadata.namespace,
            service: service.metadata.name,
            port: service.spec.ports[0].port,
          };
        }
      }
    } catch (error) {
      logger.warn(`${this.name}: failed to list services: ${error.toString()}`);
    }

    return undefined;
  }
}

export class PrometheusProviderRegistry extends Singleton {
  public providers = new Map<string, PrometheusProvider>();

  getByKind(kind: string): PrometheusProvider {
    const provider = this.providers.get(kind);

    if (!provider) {
      throw new Error("Unknown Prometheus provider");
    }

    return provider;
  }

  registerProvider(provider: PrometheusProvider): this {
    if (this.providers.has(provider.id)) {
      throw new Error("Provider already registered under that kind");
    }

    this.providers.set(provider.id, provider);

    return this;
  }
}
