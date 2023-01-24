/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../../../renderer/api/catalog/entity/registry.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import requestInitialCatalogEntitiesInjectable from "./request-entity-updates.injectable";

const setupCatalogEntityUpdatesInjectable = getInjectable({
  id: "setup-catalog-entity-updates",
  instantiate: (di) => ({
    id: "setup-catalog-entity-updates",
    run: async () => {
      const requestInitialCatalogEntities = di.inject(requestInitialCatalogEntitiesInjectable);
      const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

      const rawEntities = await requestInitialCatalogEntities();

      catalogEntityRegistry.updateItems(rawEntities);
    },
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default setupCatalogEntityUpdatesInjectable;
