/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterManagerInjectable from "../../cluster/manager.injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../runnable-tokens/phases";

const stopClusterManagerInjectable = getInjectable({
  id: "stop-cluster-manager",

  instantiate: (di) => ({
    run: () => {
      const clusterManager = di.inject(clusterManagerInjectable);

      clusterManager.stop();

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopClusterManagerInjectable;
