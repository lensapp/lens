/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/phases";
import stopLensProxyListeningInjectable from "./stop-listening.injectable";

const stopLensProxyOnQuitInjectable = getInjectable({
  id: "stop-lens-proxy-on-quit",
  instantiate: (di) => ({
    run: () => {
      const stopLensProxyListening = di.inject(stopLensProxyListeningInjectable);

      stopLensProxyListening();

      return undefined;
    },
  }),
  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopLensProxyOnQuitInjectable;
