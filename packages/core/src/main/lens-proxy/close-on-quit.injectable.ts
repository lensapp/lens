/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
// import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import lensProxyInjectable from "./lens-proxy.injectable";

const closeLensProxyOnQuitInjectable = getInjectable({
  id: "close-lens-proxy-on-quit",
  instantiate: (di) => ({
    id: "close-lens-proxy-on-quit",
    run: async () => {
      const lensProxy = di.inject(lensProxyInjectable);

      await lensProxy.close();
    },
  }),
  // injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default closeLensProxyOnQuitInjectable;
