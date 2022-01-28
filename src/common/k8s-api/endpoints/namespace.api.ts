/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeApi, SpecificApiOptions } from "../kube-api";
import { KubeObject } from "../kube-object";
import { autoBind } from "../../../renderer/utils";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";

export enum NamespaceStatus {
  ACTIVE = "Active",
  TERMINATING = "Terminating",
}

export interface Namespace {
  status?: {
    phase: string;
  };
}

export class Namespace extends KubeObject {
  static kind = "Namespace";
  static namespaced = false;
  static apiBase = "/api/v1/namespaces";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getStatus() {
    return this.status?.phase ?? "-";
  }
}

export function getMetricsForNamespace(namespace: string, selector = ""): Promise<IPodMetrics> {
  const opts = { category: "pods", pods: ".*", namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export class NamespaceApi extends KubeApi<Namespace> {
  constructor(args: SpecificApiOptions<Namespace> = {}) {
    super({
      ...args,
      objectConstructor: Namespace,
    });
  }
}
