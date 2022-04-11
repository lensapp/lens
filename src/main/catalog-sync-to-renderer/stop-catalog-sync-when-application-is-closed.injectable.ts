/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogSyncToRendererInjectable from "./catalog-sync-to-renderer.injectable";
import { onApplicationSoftQuitInjectionToken } from "../start-main-application/on-application-soft-quit/on-application-soft-quit-injection-token";

const stopCatalogSyncWhenApplicationIsClosedInjectable = getInjectable({
  id: "stop-catalog-sync-when-application-is-closed",

  instantiate: (di) => {
    const catalogSyncToRenderer = di.inject(catalogSyncToRendererInjectable);

    return {
      run: () => {
        catalogSyncToRenderer.stop();
      },
    };
  },

  injectionToken: onApplicationSoftQuitInjectionToken,
});

export default stopCatalogSyncWhenApplicationIsClosedInjectable;
