/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ipcMainOn } from "../../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../../../renderer/navigation/events";
import type { ClusterId } from "../../../../common/cluster-types";

import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../runnable-tokens/on-load-of-application-injection-token";
import currentClusterFrameClusterIdStateInjectable from "./current-cluster-frame-cluster-id-state.injectable";

const setupListenerForCurrentClusterFrameInjectable = getInjectable({
  id: "setup-listener-for-current-cluster-frame",

  instantiate: (di) => ({
    run: () => {
      const currentClusterFrameState = di.inject(currentClusterFrameClusterIdStateInjectable);

      ipcMainOn(
        IpcRendererNavigationEvents.CLUSTER_VIEW_CURRENT_ID,
        (event, clusterId: ClusterId) => {
          currentClusterFrameState.set(clusterId);
        },
      );
    },
  }),

  causesSideEffects: true,

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupListenerForCurrentClusterFrameInjectable;
