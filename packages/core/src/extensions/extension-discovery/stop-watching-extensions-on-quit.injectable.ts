/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onQuitOfBackEndInjectionToken } from "../../main/start-main-application/runnable-tokens/phases";
import extensionDiscoveryInjectable from "./extension-discovery.injectable";

const stopWatchingExtensionsOnQuitInjectable = getInjectable({
  id: "stop-watching-extensions-on-quit",

  instantiate: (di) => ({
    run: async () => {
      const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

      await extensionDiscovery.stopWatchingExtensions();
    },
  }),

  injectionToken: onQuitOfBackEndInjectionToken,
});

export default stopWatchingExtensionsOnQuitInjectable;
