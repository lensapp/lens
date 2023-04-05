/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import lensProtocolRouterMainInjectable  from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import { afterQuitOfFrontEndInjectionToken } from "../../runnable-tokens/phases";

const flagRendererAsNotLoadedInjectable = getInjectable({
  id: "stop-deep-linking",

  instantiate: (di) => ({
    run: () => {
      const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);

      runInAction(() => {
        // Todo: remove this kludge which enables out-of-place temporal dependency.
        lensProtocolRouterMain.rendererLoaded.set(false);
      });

      return undefined;
    },
  }),

  injectionToken: afterQuitOfFrontEndInjectionToken,
});

export default flagRendererAsNotLoadedInjectable;
