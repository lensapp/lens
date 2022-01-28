/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestPromiseOptions } from "request-promise-native";
import type { Cluster } from "../../common/cluster/cluster";

export interface ClusterDetectionResult {
  value: string | number | boolean
  accuracy: number
}

export interface BaseClusterDetectorDependencies {
  k8sRequest: (cluster: Cluster, path: string, options: RequestPromiseOptions) => Promise<any>;
}

export abstract class BaseClusterDetector {
  constructor(public cluster: Cluster, protected readonly dependencies: BaseClusterDetectorDependencies) {
  }

  abstract detect(): Promise<ClusterDetectionResult>;

  protected k8sRequest(path: string, options: RequestPromiseOptions = {}): Promise<any> {
    return this.dependencies.k8sRequest(this.cluster, path, options);
  }
}
