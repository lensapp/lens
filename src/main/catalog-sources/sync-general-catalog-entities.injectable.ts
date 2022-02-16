/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import generalCatalogEntitiesInjectable from "../../common/catalog-entities/general-catalog-entities/general-catalog-entities.injectable";
import catalogEntityRegistryInjectable from "../catalog/catalog-entity-registry.injectable";

const syncGeneralCatalogEntitiesInjectable = getInjectable({
  id: "sync-general-catalog-entities",

  instantiate: (di) => {
    const generalCatalogEntities = di.inject(generalCatalogEntitiesInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return () => {
      catalogEntityRegistry.addObservableSource(
        "lens:general",
        generalCatalogEntities,
      );
    };
  },
});

export default syncGeneralCatalogEntitiesInjectable;
