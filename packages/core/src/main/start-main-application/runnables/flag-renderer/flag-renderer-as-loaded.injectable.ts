/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/phases";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { runInAction } from "mobx";

const flagRendererAsLoadedInjectable = getInjectable({
  id: "flag-renderer-as-loaded",

  instantiate: (di) => ({
    run: () => {
      const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

      runInAction(() => {
        // Todo: remove this kludge which enables out-of-place temporal dependency.
        lensProtocolRouterMain.rendererLoaded.set(true);
      });
    },
  }),

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default flagRendererAsLoadedInjectable;
