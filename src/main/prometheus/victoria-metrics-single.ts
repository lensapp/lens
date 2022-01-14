/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PrometheusLens } from "./lens";
import type { CoreV1Api } from "@kubernetes/client-node";
import type { PrometheusService } from "./provider-registry";

export class PrometheusVictoriaMetricsSingle extends PrometheusLens {
  readonly id: string = "victoria-metrics-single";
  readonly name: string = "Victoria Metrics (single)";
  readonly rateAccuracy: string = "5m";
  readonly isConfigurable: boolean = true;

  public async getPrometheusService(client: CoreV1Api): Promise<PrometheusService> {
    return this.getFirstNamespacedService(client, "app=server,app.kubernetes.io/name=victoria-metrics-single");
  }
}
