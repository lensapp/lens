/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../runnable-tokens/before-quit-of-back-end-injection-token";
import setupLensProxyStartableInjectable from "./startable-stoppable.injectable";

const stopSettingUpLensProxyInjectable = getInjectable({
  id: "stop-setting-up-lens-proxy",
  instantiate: (di) => {
    const setupLensProxyStartableStoppable = di.inject(setupLensProxyStartableInjectable);

    return {
      id: "stop-setting-up-lens-proxy",
      run: () => void setupLensProxyStartableStoppable.stop(),
    };
  },
  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopSettingUpLensProxyInjectable;
