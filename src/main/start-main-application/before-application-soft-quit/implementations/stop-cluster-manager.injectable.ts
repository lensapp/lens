/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterManagerInjectable from "../../../cluster-manager.injectable";
import { beforeApplicationSoftQuitInjectionToken } from "../before-application-soft-quit-injection-token";

const stopClusterManagerInjectable = getInjectable({
  id: "stop-cluster-manager",

  instantiate: (di) => {
    const clusterManager = di.inject(clusterManagerInjectable);

    return {
      run: () => {
        clusterManager.stop(); // close cluster connections
      },
    };
  },

  injectionToken: beforeApplicationSoftQuitInjectionToken,

  causesSideEffects: true,
});

export default stopClusterManagerInjectable;
