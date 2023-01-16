/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";

export interface ClusterDetectionResult {
  value: string | number | boolean;
  accuracy: number;
}

export interface FallibleOnlyClusterMetadataDetector {
  readonly key: string;
  detect(cluster: Cluster): Promise<ClusterDetectionResult>;
}

export interface ClusterMetadataDetector {
  readonly key: string;
  detect(cluster: Cluster): Promise<ClusterDetectionResult | null>;
}

export const clusterMetadataDetectorInjectionToken = getInjectionToken<ClusterMetadataDetector>({
  id: "cluster-metadata-detector-token",
});
