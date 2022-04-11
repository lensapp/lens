/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onApplicationQuitInjectionToken } from "../on-application-quit-injection-token";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";

const cleanUpProtocolRouterMainInjectable = getInjectable({
  id: "clean-up-protocol-router-main",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: () => {
        lensProtocolRouterMain.cleanup();
      },
    };
  },

  injectionToken: onApplicationQuitInjectionToken,
});

export default cleanUpProtocolRouterMainInjectable;
