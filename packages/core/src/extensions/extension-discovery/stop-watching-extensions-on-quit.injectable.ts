/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import extensionDiscoveryInjectable from "./extension-discovery.injectable";

const stopWatchingExtensionsOnQuitInjectable = getInjectable({
  id: "stop-watching-extensions-on-quit",

  instantiate: (di) => {
    const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

    return {
      id: "stop-watching-extensions-on-quit",

      run: async () => {
        await extensionDiscovery.stopWatchingExtensions();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopWatchingExtensionsOnQuitInjectable;
