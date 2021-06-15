/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { observable } from "mobx";
import type { ClusterMetadata } from "../../common/cluster-types";
import { Singleton } from "../../common/utils";
import type { Cluster } from "../cluster";
import type { BaseClusterDetector, ClusterDetectionResult } from "./base-cluster-detector";

export class DetectorRegistry extends Singleton {
  registry = observable.array<typeof BaseClusterDetector>([], { deep: false });

  add(detectorClass: typeof BaseClusterDetector): this {
    this.registry.push(detectorClass);

    return this;
  }

  async detectForCluster(cluster: Cluster): Promise<ClusterMetadata> {
    const results: {[key: string]: ClusterDetectionResult } = {};

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
