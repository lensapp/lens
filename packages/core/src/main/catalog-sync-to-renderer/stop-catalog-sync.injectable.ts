/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

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

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopCatalogSyncInjectable;
