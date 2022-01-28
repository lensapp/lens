/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export enum MetricType {
  MEMORY = "memory",
  CPU = "cpu",
}

export enum MetricNodeRole {
  MASTER = "master",
  WORKER = "worker",
}

export interface ClusterOverviewStorageState {
  metricType: MetricType;
  metricNodeRole: MetricNodeRole,
}
