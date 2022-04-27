/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../catalog/catalog-entity-registry.injectable";
import { startCatalogSyncToRenderer } from "../catalog-pusher";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    let disposer: () => void;

    return {
      start: () => {
        disposer = startCatalogSyncToRenderer(catalogEntityRegistry);
      },

      stop: () => disposer?.(),
    };
  },
});

export default catalogSyncToRendererInjectable;
