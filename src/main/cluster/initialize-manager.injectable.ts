/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import clusterManagerInjectable from "./manager.injectable";

const initializeClusterManagerInjectable = getInjectable({
  id: "initialize-cluster-manager",
  instantiate: (di) => {
    const clusterManager = di.inject(clusterManagerInjectable);

    return {
      id: "initialize-cluster-manager",
      run: () => {
        clusterManager.init();
      },
    };
  },
  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default initializeClusterManagerInjectable;
