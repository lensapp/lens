/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Cluster, ClusterApi, IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { autoBind } from "../../utils";
import type { IMetricsReqParams } from "../../../common/k8s-api/endpoints/metrics.api";
import { MetricNodeRole, MetricType } from "./overview.state";

export class ClusterStore extends KubeObjectStore<Cluster> {
  /**
   * @deprecated no longer used
   */
  metrics: Partial<IClusterMetrics> = {};

  /**
   * @deprecated no longer used
   */
  metricsLoaded = false;

  /**
   * @deprecated no longer used
   */
  metricType = MetricType.CPU;

  /**
   * @deprecated no longer used
   */
  metricNodeRole = MetricNodeRole.MASTER;

  constructor(public readonly api:ClusterApi) {
    super();
    autoBind(this);
  }

  /**
   * @deprecated no longer used
   */
  loadMetrics(params?: IMetricsReqParams) {
    void params;

    return Promise.resolve();
  }

  /**
   * @deprecated no longer used
   */
  getMetricsValues(source: Partial<IClusterMetrics>): [number, string][] {
    void source;

    return [];
  }

  /**
   * @deprecated no longer used
   */
  resetMetrics() {
    return;
  }
}
