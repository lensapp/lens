/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../start-main-application/runnable-tokens/after-root-frame-is-ready-injection-token";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";

const startCatalogSyncInjectable = getInjectable({
  id: "start-catalog-sync",

  instantiate: (di) => {
    const catalogSyncToRenderer = di.inject(catalogSyncToRendererInjectable);

    return {
      id: "start-catalog-sync",
      run: async () => {
        if (!catalogSyncToRenderer.started) {
          await catalogSyncToRenderer.start();
        }
      },
    };
  },

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default startCatalogSyncInjectable;
