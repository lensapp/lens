/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PrometheusLens } from "./lens";
import type { CoreV1Api } from "@kubernetes/client-node";
import type { PrometheusService } from "./provider-registry";
import { isRequestError } from "../../common/utils";

export class PrometheusHelm14 extends PrometheusLens {
  readonly id: string = "helm14";
  readonly name: string = "Helm 14.x";
  readonly rateAccuracy: string = "5m";
  readonly isConfigurable: boolean = true;

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService> {
    try {
      const selector = "app=prometheus,component=server,heritage=Helm";
      const { body: { items: [service] }} = await client.listServiceForAllNamespaces(undefined, undefined, undefined, selector);

      if (service?.metadata?.namespace && service.metadata.name && service.spec?.ports && service.metadata?.labels?.chart?.startsWith("prometheus-14")) {
        return {
          id: this.id,
          namespace: service.metadata.namespace,
          service: service.metadata.name,
          port: service.spec.ports[0].port,
        };
      }
    } catch (error) {
      throw new Error(`Failed to list services for Prometheus ${this.name} in all namespaces: ${isRequestError(error) ? error.response?.body.message : error}`);
    }

    throw new Error(`No service found for Prometheus ${this.name} from any namespace`);
  }
}
