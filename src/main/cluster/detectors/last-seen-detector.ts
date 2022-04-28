/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../../../common/cluster/types";

export class LastSeenDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.LAST_SEEN;

  public async detect() {
    if (!this.cluster.accessible) return null;

    await this.k8sRequest("/version");

    return { value: new Date().toJSON(), accuracy: 100 };
  }
}
