/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { startCatalogSyncToRenderer } from "../catalog-pusher";
import { getSyncStartableStoppable } from "../../common/utils/get-startable-stoppable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return getSyncStartableStoppable("catalog-sync", () =>
      startCatalogSyncToRenderer(catalogEntityRegistry),
    );
  },

  causesSideEffects: true,
});

export default catalogSyncToRendererInjectable;
