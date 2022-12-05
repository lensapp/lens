/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import { beforeFrameStartsInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initClusterStoreInjectable from "../../store/renderer/init.injectable";
import requestInitialClusterStatesInjectable from "./request-initial.injectable";

const setupClusterStateSyncInjectable = getInjectable({
  id: "setup-cluster-state-sync",
  instantiate: (di) => ({
    id: "setup-cluster-state-sync",
    run: async () => {
      const requestInitialClusterStates = di.inject(requestInitialClusterStatesInjectable);
      const getClusterById = di.inject(getClusterByIdInjectable);
      const initalStates = await requestInitialClusterStates();

      for (const { clusterId, state } of initalStates) {
        getClusterById(clusterId)?.setState(state);
      }
    },
    runAfter: di.inject(initClusterStoreInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupClusterStateSyncInjectable;
