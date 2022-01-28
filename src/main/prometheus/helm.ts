/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PrometheusLens } from "./lens";
import type { CoreV1Api } from "@kubernetes/client-node";
import type { PrometheusService } from "./provider-registry";

export class PrometheusHelm extends PrometheusLens {
  readonly id: string = "helm";
  readonly name: string = "Helm";
  readonly rateAccuracy: string = "5m";
  readonly isConfigurable: boolean = true;

  public getPrometheusService(client: CoreV1Api): Promise<PrometheusService> {
    return this.getFirstNamespacedService(client, "app=prometheus,component=server,heritage=Helm");
  }
}
