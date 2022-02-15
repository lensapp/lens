/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { ClusterMetadata } from "../../common/cluster-types";
import { iter, Singleton } from "../../common/utils";
import type { Cluster } from "../../common/cluster/cluster";
import type { BaseClusterDetector, ClusterDetectionResult } from "./base-cluster-detector";

export type ClusterDetectionConstructor = new (cluster: Cluster) => BaseClusterDetector;

export class DetectorRegistry extends Singleton {
  private registry = observable.array<ClusterDetectionConstructor>([], { deep: false });

  add(detectorClass: ClusterDetectionConstructor): this {
    this.registry.push(detectorClass);

    return this;
  }

  async detectForCluster(cluster: Cluster): Promise<ClusterMetadata> {
    const results = new Map<string, ClusterDetectionResult>();
    const detections = this.registry.map(async DetectorClass => {
      const detector = new DetectorClass(cluster);

      return [detector.key, await detector.detect()] as const;
    });

    for (const detection of detections) {
      try {
        const [key, data] = await detection;

        if (
          data && (
            !results.has(key)
            || results.get(key).accuracy <= data.accuracy
          )
        ) {
          results.set(key, data);
        }
      } catch {
        // ignore errors
      }
    }

    return Object.fromEntries(
      iter.map(
        results.entries(),
        ([key, { value }]) => [key, value],
      ),
    );
  }
}
