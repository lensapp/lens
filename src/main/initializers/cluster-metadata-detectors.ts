/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ClusterIdDetector } from "../cluster/detectors/cluster-id-detector";
import { DetectorRegistry } from "../cluster/detectors/detector-registry";
import { DistributionDetector } from "../cluster/detectors/distribution-detector";
import { LastSeenDetector } from "../cluster/detectors/last-seen-detector";
import { NodesCountDetector } from "../cluster/detectors/nodes-count-detector";
import { VersionDetector } from "../cluster/detectors/version-detector";

export function initClusterMetadataDetectors() {
  DetectorRegistry.createInstance()
    .add(ClusterIdDetector)
    .add(LastSeenDetector)
    .add(VersionDetector)
    .add(DistributionDetector)
    .add(NodesCountDetector);
}
