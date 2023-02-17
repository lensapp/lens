/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { toJS } from "../../common/utils";
import broadcastCurrentCatalogEntityRegistryStateInjectable from "../../features/catalog/entities-sync/main/broadcast.injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";

const pushCatalogToRendererInjectable = getInjectable({
  id: "push-catalog-to-renderer",
  instantiate: (di) => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const broadcastCurrentCatalogEntityRegistryState = di.inject(broadcastCurrentCatalogEntityRegistryStateInjectable);

    return () => broadcastCurrentCatalogEntityRegistryState(toJS(catalogEntityRegistry.items));
  },
});

export default pushCatalogToRendererInjectable;
