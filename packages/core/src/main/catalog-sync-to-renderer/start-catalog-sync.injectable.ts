/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterRootFrameIsReadyInjectionToken } from "../start-main-application/runnable-tokens/phases";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";

const startCatalogSyncInjectable = getInjectable({
  id: "start-catalog-sync",

  instantiate: (di) => ({
    run: () => {
      const catalogSyncToRenderer = di.inject(catalogSyncToRendererInjectable);

      if (!catalogSyncToRenderer.started) {
        catalogSyncToRenderer.start();
      }
    },
  }),

  injectionToken: afterRootFrameIsReadyInjectionToken,
});

export default startCatalogSyncInjectable;
