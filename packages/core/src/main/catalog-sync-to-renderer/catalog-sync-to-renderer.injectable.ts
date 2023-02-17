/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { toJS } from "../../common/utils";
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import broadcastCurrentCatalogEntityRegistryStateInjectable from "../../features/catalog/entities-sync/main/broadcast.injectable";

const catalogSyncToRendererInjectable = getInjectable({
  id: "catalog-sync-to-renderer",

  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const broadcastCurrentCatalogEntityRegistryState = di.inject(broadcastCurrentCatalogEntityRegistryStateInjectable);

    return getStartableStoppable(
      "catalog-sync",
      () => reaction(() => toJS(catalogEntityRegistry.items), (items) => {
        broadcastCurrentCatalogEntityRegistryState(items);
      }, {
        fireImmediately: true,
      }),
    );
  },
});

export default catalogSyncToRendererInjectable;
