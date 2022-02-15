/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type { OptionsOfJSONResponseBody } from "got";
import { k8sRequest } from "../k8s-request";

export type ClusterDetectionResult = {
  value: string | number | boolean
  accuracy: number
};

export abstract class BaseClusterDetector {
  abstract key: string;

  constructor(public cluster: Cluster) {}

  abstract detect(): Promise<ClusterDetectionResult>;

  protected async k8sRequest<T = any>(path: string, options: OptionsOfJSONResponseBody = {}): Promise<T> {
    return k8sRequest(this.cluster, path, options);
  }
}
