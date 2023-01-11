/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import currentClusterFrameClusterIdStateInjectable from "./current-cluster-frame-cluster-id-state.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";

const currentClusterFrameInjectable = getInjectable({
  id: "current-cluster-frame",

  instantiate: (di) => {
    const currentClusterFrameState = di.inject(currentClusterFrameClusterIdStateInjectable);
    const clusterFrames = di.inject(clusterFramesInjectable);

    return computed(() => {
      const clusterId = currentClusterFrameState.get();

      if (!clusterId) {
        return undefined;
      }

      return clusterFrames.get(clusterId);
    });
  },
});

export default currentClusterFrameInjectable;
