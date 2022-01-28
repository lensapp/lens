/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { ClusterMetadata } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import type { BaseClusterDetector, BaseClusterDetectorDependencies, ClusterDetectionResult } from "./base-cluster-detector";

export interface DetectorRegistryDependencies extends BaseClusterDetectorDependencies {
}

export class DetectorRegistry {
  registry = observable.map<string, new (cluster: Cluster, deps: BaseClusterDetectorDependencies) => BaseClusterDetector>([], { deep: false });

  constructor(protected readonly dependencies: DetectorRegistryDependencies) {}

  add(key: string, detectorClass: new (cluster: Cluster, deps: BaseClusterDetectorDependencies) => BaseClusterDetector) {
    this.registry.set(key, detectorClass);
  }

  detectForCluster = async (cluster: Cluster): Promise<ClusterMetadata> => {
    const results: { [key: string]: ClusterDetectionResult } = {};

    for (const [key, detectorClass] of this.registry) {
      const detector = new detectorClass(cluster, this.dependencies);

      try {
        const data = await detector.detect();

        if (data) {
          const existingValue = results[key];

          if (!existingValue || existingValue.accuracy <= data.accuracy) {
            results[key] = data;
          }
        }
      } catch (e) {
        // detector raised error, do nothing
      }
    }

    const metadata: ClusterMetadata = {};

    for (const [key, result] of Object.entries(results)) {
      metadata[key] = result.value;
    }

    return metadata;
  };

  detectSpecificForCluster = (key: string, cluster: Cluster) => {
    const detector = new (this.registry.get(key))(cluster, this.dependencies);

    return detector.detect();
  };
}
