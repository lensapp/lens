/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import lensProtocolRouterMainInjectable  from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { beforeApplicationSoftQuitInjectionToken } from "../before-application-soft-quit-injection-token";

const flagRendererAsNotLoaded = getInjectable({
  id: "stop-deep-linking",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

    return {
      run: () => {
        runInAction(() => {
          // Todo: remove this kludge which enables out-of-place temporal dependency.
          lensProtocolRouterMain.rendererLoaded = false;
        });
      },
    };
  },

  injectionToken: beforeApplicationSoftQuitInjectionToken,
});

export default flagRendererAsNotLoaded;
