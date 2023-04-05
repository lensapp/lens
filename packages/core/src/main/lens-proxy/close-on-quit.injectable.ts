/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/phases";
import lensProxyInjectable from "./lens-proxy.injectable";

const closeLensProxyOnQuitInjectable = getInjectable({
  id: "close-lens-proxy-on-quit",
  instantiate: (di) => ({
    run: async () => {
      const lensProxy = di.inject(lensProxyInjectable);

      await lensProxy.close();
    },
  }),
  injectionToken: onQuitOfBackEndInjectionToken,
});

export default closeLensProxyOnQuitInjectable;
