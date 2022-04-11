/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable  from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { onApplicationSoftQuitInjectionToken } from "../on-application-soft-quit-injection-token";

const makeProtocolRouterNotHaveLoadedRendererInjectable = getInjectable({
  id: "make-protocol-router-not-have-loaded-renderer",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: () => {
        // This is set to false here so that LPRM can wait to send future lens://
        // requests until after it loads again
        lensProtocolRouterMain.rendererLoaded = false;
      },
    };
  },

  injectionToken: onApplicationSoftQuitInjectionToken,
});

export default makeProtocolRouterNotHaveLoadedRendererInjectable;
