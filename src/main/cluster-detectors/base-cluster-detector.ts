/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestPromiseOptions } from "request-promise-native";
import type { Cluster } from "../../common/cluster/cluster";
import type { K8sRequest } from "../k8s-request.injectable";

export interface ClusterDetectionResult {
  value: string | number | boolean;
  accuracy: number;
}

export class BaseClusterDetector {
  key: string;

  constructor(public cluster: Cluster, private _k8sRequest: K8sRequest) {
  }

  detect(): Promise<ClusterDetectionResult> {
    return null;
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    return this._k8sRequest(this.cluster, path, options);
  }
}
