/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeMainFrameStartsFirstInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import setupEmittingNetworkStateInjectable from "./setup-emiting-network-state.injectable";

const runSetupEmitNetworkStateInjectable = getInjectable({
  id: "run-setup-emit-network-state",
  instantiate: (di) => ({
    id: "run-setup-emit-network-state",
    run: () => {
      const setupEmittingNetworkState = di.inject(setupEmittingNetworkStateInjectable);

      setupEmittingNetworkState();
    },
  }),
  injectionToken: beforeMainFrameStartsFirstInjectionToken,
});

export default runSetupEmitNetworkStateInjectable;
