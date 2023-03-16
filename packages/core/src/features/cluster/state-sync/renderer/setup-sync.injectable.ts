/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import getClusterByIdInjectable from "../../storage/common/get-by-id.injectable";
import initClusterStoreInjectable from "../../storage/renderer/init.injectable";
import requestInitialClusterStatesInjectable from "./request-initial.injectable";

const setupClusterStateSyncInjectable = getInjectable({
  id: "setup-cluster-state-sync",
  instantiate: (di) => ({
    run: async () => {
      const requestInitialClusterStates = di.inject(requestInitialClusterStatesInjectable);
      const getClusterById = di.inject(getClusterByIdInjectable);
      const initialStates = await requestInitialClusterStates();

      for (const { clusterId, state } of initialStates) {
        getClusterById(clusterId)?.setState(state);
      }
    },
    runAfter: initClusterStoreInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupClusterStateSyncInjectable;
