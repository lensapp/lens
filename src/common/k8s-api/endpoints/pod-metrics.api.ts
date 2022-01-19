/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface PodMetrics {
  timestamp: string;
  window: string;
  containers: {
    name: string;
    usage: {
      cpu: string;
      memory: string;
    };
  }[];
}

export class PodMetrics extends KubeObject {
  static kind = "PodMetrics";
  static namespaced = true;
  static apiBase = "/apis/metrics.k8s.io/v1beta1/pods";
}

let podMetricsApi: KubeApi<PodMetrics>;

if (isClusterPageContext()) {
  podMetricsApi = new KubeApi<PodMetrics>({
    objectConstructor: PodMetrics,
  });
}

export {
  podMetricsApi,
};
