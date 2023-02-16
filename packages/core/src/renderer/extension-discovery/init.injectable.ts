/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionDiscoveryInjectable from "../../extensions/extension-discovery/extension-discovery.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../before-frame-starts/tokens";

const initializeExtensionDiscoveryInjectable = getInjectable({
  id: "initialize-extension-discovery",
  instantiate: (di) => ({
    id: "initialize-extension-discovery",
    run: async () => {
      const extensionDiscovery = di.inject(extensionDiscoveryInjectable);

      await extensionDiscovery.init();
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initializeExtensionDiscoveryInjectable;
