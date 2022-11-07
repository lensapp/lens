/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import stopSettingUpLensProxyInjectable from "../start-main-application/runnables/lens-proxy/teardown.injectable";
import lensProxyInjectable from "./lens-proxy.injectable";

const stopLensProxyOnQuitInjectable = getInjectable({
  id: "stop-lens-proxy-on-quit",
  instantiate: (di) => {
    const lensProxy = di.inject(lensProxyInjectable);

    return {
      id: "stop-lens-proxy",
      run: () => void lensProxy.close(),
      runAfter: di.inject(stopSettingUpLensProxyInjectable),
    };
  },
  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopLensProxyOnQuitInjectable;
