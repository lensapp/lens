/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData, KubeObjectMetadata, KubeObjectScope, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";

export interface PodMetricsData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  timestamp: string;
  window: string;
  containers: PodMetricsContainer[];
}

export interface PodMetricsContainerUsage {
  cpu: string;
  memory: string;
}

export interface PodMetricsContainer {
  name: string;
  usage: PodMetricsContainerUsage;
}

export class PodMetrics extends KubeObject<NamespaceScopedMetadata, void, void> {
  static readonly kind = "PodMetrics";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/metrics.k8s.io/v1beta1/pods";

  timestamp: string;

  window: string;

  containers: PodMetricsContainer[];

  constructor({ timestamp, window, containers, ...rest }: PodMetricsData) {
    super(rest);
    this.timestamp = timestamp;
    this.window = window;
    this.containers = containers;
  }
}
