/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import lensProtocolRouterMainInjectable from "../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";

const cleanUpDeepLinkingInjectable = getInjectable({
  id: "clean-up-deep-linking",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: () => {
        lensProtocolRouterMain.cleanup();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default cleanUpDeepLinkingInjectable;
