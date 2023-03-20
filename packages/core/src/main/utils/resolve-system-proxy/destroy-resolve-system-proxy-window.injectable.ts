/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import resolveSystemProxyWindowInjectable from "./resolve-system-proxy-window.injectable";

const destroyResolveSystemProxyWindowInjectable = getInjectable({
  id: "destroy-resolev-system-proxy-window",

  instantiate: (di) => ({
    run: () => {
      di.inject(resolveSystemProxyWindowInjectable).destroy();

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default destroyResolveSystemProxyWindowInjectable;
