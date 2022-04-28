/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { ClusterMetadata } from "../../../common/cluster/types";
import { Singleton } from "../../../common/utils";
import type { Cluster } from "../../../common/cluster/cluster";
import type { BaseClusterDetector, ClusterDetectionResult } from "./base-cluster-detector";

export class DetectorRegistry extends Singleton {
  registry = observable.array<typeof BaseClusterDetector>([], { deep: false });

  add(detectorClass: typeof BaseClusterDetector): this {
    this.registry.push(detectorClass);

    return this;
  }

  async detectForCluster(cluster: Cluster): Promise<ClusterMetadata> {
    const results: { [key: string]: ClusterDetectionResult } = {};

    for (const detectorClass of this.registry) {
      const detector = new detectorClass(cluster);

      try {
        const data = await detector.detect();

        if (!data) continue;
        const existingValue = results[detector.key];

        if (existingValue && existingValue.accuracy > data.accuracy) continue; // previous value exists and is more accurate
        results[detector.key] = data;
      } catch (e) {
        // detector raised error, do nothing
      }
    }
    const metadata: ClusterMetadata = {};

    for (const [key, result] of Object.entries(results)) {
      metadata[key] = result.value;
    }

    return metadata;
  }
}
