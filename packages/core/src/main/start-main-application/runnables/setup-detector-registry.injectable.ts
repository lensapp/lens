/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterIdDetector } from "../../cluster-detectors/cluster-id-detector";
import { LastSeenDetector } from "../../cluster-detectors/last-seen-detector";
import { VersionDetector } from "../../cluster-detectors/version-detector";
import { DistributionDetector } from "../../cluster-detectors/distribution-detector";
import { NodesCountDetector } from "../../cluster-detectors/nodes-count-detector";
import detectorRegistryInjectable from "../../cluster-detectors/detector-registry.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const setupDetectorRegistryInjectable = getInjectable({
  id: "setup-detector-registry",

  instantiate: (di) => {
    const detectorRegistry = di.inject(detectorRegistryInjectable);

    return {
      id: "setup-detector-registry",
      run: () => {
        detectorRegistry
          .add(ClusterIdDetector)
          .add(LastSeenDetector)
          .add(VersionDetector)
          .add(DistributionDetector)
          .add(NodesCountDetector);
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDetectorRegistryInjectable;
