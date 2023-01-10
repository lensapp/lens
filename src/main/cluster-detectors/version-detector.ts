/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BaseClusterDetector } from "./base-cluster-detector";
import { ClusterMetadataKey } from "../../common/cluster-types";

export class VersionDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.VERSION;

  public async detect() {
    const response = await this.k8sRequest("/version") as { gitVersion: string };

    return {
      value: response.gitVersion,
      accuracy: 100,
    };
  }
}
