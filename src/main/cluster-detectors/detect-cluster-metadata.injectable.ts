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
import { hasDefinedTupleValue, isDefined, object } from "../../common/utils";
import type { ClusterDetectionResult, ClusterMetadataDetector } from "./base-cluster-detector";
import { clusterMetadataDetectorInjectionToken } from "./base-cluster-detector";

export type DetectClusterMetadata = (cluster: Cluster) => Promise<ClusterMetadata>;

const pickHighestAccuracy = (prev: ClusterDetectionResult, curr: ClusterDetectionResult) => (
  prev.accuracy > curr.accuracy
    ? prev
    : curr
);

const detectMetadataWithFor = (cluster: Cluster) => async (clusterMetadataDetector: ClusterMetadataDetector) => {
  try {
    return await clusterMetadataDetector.detect(cluster);
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
        map(([ key, results ]) => [key, reduce(results, pickHighestAccuracy)] as const),
        filter(hasDefinedTupleValue),
      );

      return object.fromEntries(entries);
    };
  },
});

export default detectClusterMetadataInjectable;
