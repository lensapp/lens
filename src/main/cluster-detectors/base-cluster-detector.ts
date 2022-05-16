/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestPromiseOptions } from "request-promise-native";
import type { Cluster } from "../../common/cluster/cluster";
import { k8sRequest } from "../k8s-request";

export interface ClusterDetectionResult {
  value: string | number | boolean;
  accuracy: number;
}

export abstract class BaseClusterDetector {
  abstract readonly key: string;

  constructor(public readonly cluster: Cluster) {}

  abstract detect(): Promise<ClusterDetectionResult | null>;

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    return k8sRequest(this.cluster, path, options);
  }
}
