/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../start-main-application/runnable-tokens/before-quit-of-front-end-injection-token";

const stopCatalogSyncInjectable = getInjectable({
  id: "stop-catalog-sync",

  instantiate: (di) => {
    const catalogSyncToRenderer = di.inject(catalogSyncToRendererInjectable);

    return {
      id: "stop-catalog-sync",
      run: () => {
        if (catalogSyncToRenderer.started) {
          catalogSyncToRenderer.stop();
        }

        return undefined;
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default stopCatalogSyncInjectable;
