/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../../../common/cluster/types";

export class NodesCountDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.NODES_COUNT;

  public async detect() {
    if (!this.cluster.accessible) return null;
    const nodeCount = await this.getNodeCount();

    return { value: nodeCount, accuracy: 100 };
  }

  protected async getNodeCount(): Promise<number> {
    const response = await this.k8sRequest("/api/v1/nodes");

    return response.items.length;
  }
}
