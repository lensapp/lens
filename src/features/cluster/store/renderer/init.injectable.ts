/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import initUserStoreInjectable from "../../../../renderer/stores/init-user-store.injectable";

const initClusterStoreInjectable = getInjectable({
  id: "init-cluster-store",
  instantiate: (di) => ({
    id: "init-cluster-store",
    run: () => {
      const clusterStore = di.inject(clusterStoreInjectable);

      clusterStore.load();
    },
    runAfter: di.inject(initUserStoreInjectable),
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initClusterStoreInjectable;
