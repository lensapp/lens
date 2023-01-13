/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initUserStoreInjectable from "../../../../main/stores/init-user-store.injectable";
import initAuthHeaderStateInjectable from "../../../auth-header/main/init-state.injectable";

const initClusterStoreInjectable = getInjectable({
  id: "init-cluster-store",
  instantiate: (di) => ({
    id: "init-cluster-store",
    run: () => {
      const clusterStore = di.inject(clusterStoreInjectable);

      clusterStore.load();
    },
    runAfter: [
      di.inject(initUserStoreInjectable),
      di.inject(initAuthHeaderStateInjectable),
    ],
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initClusterStoreInjectable;
