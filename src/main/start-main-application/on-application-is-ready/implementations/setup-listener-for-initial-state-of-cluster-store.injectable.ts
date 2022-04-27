/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onApplicationIsReadyInjectionToken } from "../on-application-is-ready-injection-token";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";

const setupListenerForInitialStateOfClusterStoreInjectable = getInjectable({
  id: "setup-listener-for-initial-state-of-cluster-store",

  instantiate: (di) => {
    const clusterStore = di.inject(clusterStoreInjectable);

    return {
      run: () => {
        clusterStore.provideInitialFromMain();
      },
    };
  },

  injectionToken: onApplicationIsReadyInjectionToken,
});

export default setupListenerForInitialStateOfClusterStoreInjectable;
