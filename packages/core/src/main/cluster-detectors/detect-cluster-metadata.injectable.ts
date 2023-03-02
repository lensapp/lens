/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { groupBy, reduce } from "lodash";
import { filter, map } from "lodash/fp";
import type { ClusterMetadata } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import { hasDefinedTupleValue, isDefined, object } from "@k8slens/utilities";
import type { ClusterDetectionResult, ClusterMetadataDetector } from "./token";
import { clusterMetadataDetectorInjectionToken } from "./token";

export type DetectClusterMetadata = (cluster: Cluster) => Promise<ClusterMetadata>;

const pickHighestAccuracy = (prev: ClusterDetectionResult, curr: ClusterDetectionResult) => (
  prev.accuracy > curr.accuracy
    ? prev
    : curr
);

const detectMetadataWithFor = (cluster: Cluster) => async (clusterMetadataDetector: ClusterMetadataDetector) => {
  try {
    return {
      key: clusterMetadataDetector.key,
      result: await clusterMetadataDetector.detect(cluster),
    };
  } catch {
    return null;
  }
};

const detectClusterMetadataInjectable = getInjectable({
  id: "detect-cluster-metadata",
  instantiate: (di): DetectClusterMetadata => {
    const clusterMetadataDetectors = di.injectMany(clusterMetadataDetectorInjectionToken);

    return async (cluster) => {
      const entries = pipeline(
        await Promise.all(clusterMetadataDetectors.map(detectMetadataWithFor(cluster))),
        filter(isDefined),
        (arg) => groupBy(arg, "key"),
        (arg) => object.entries(arg),
        map(([ key, detectionResults ]) => {
          const results = detectionResults.map(({ result }) => result as ClusterDetectionResult);
          const highestAccuracyResult = reduce(results, pickHighestAccuracy)?.value;

          return [key, highestAccuracyResult] as const;
        }),
        filter(hasDefinedTupleValue),
      );

      return object.fromEntries(entries);
    };
  },
});

export default detectClusterMetadataInjectable;
