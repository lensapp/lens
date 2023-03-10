/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import clusterManagerInjectable from "./manager.injectable";

const initializeClusterManagerInjectable = getInjectable({
  id: "initialize-cluster-manager",
  instantiate: (di) => ({
    run: () => {
      const clusterManager = di.inject(clusterManagerInjectable);

      clusterManager.init();
    },
  }),
  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default initializeClusterManagerInjectable;
