/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import { generalCatalogEntityInjectionToken } from "../../common/catalog-entities/general-catalog-entities/general-catalog-entity-injection-token";
import { computed } from "mobx";

const syncGeneralCatalogEntitiesInjectable = getInjectable({
  id: "sync-general-catalog-entities",

  instantiate: (di) => {
    const generalCatalogEntities = di.injectMany(generalCatalogEntityInjectionToken);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    // TODO: This shouldn't be reactive at all but catalogEntityRegistry accepts only reactive sources
    const reactiveGeneralCatalogEntities = computed(() => generalCatalogEntities);

    return () => {
      catalogEntityRegistry.addComputedSource(
        "lens:general",
        reactiveGeneralCatalogEntities,
      );
    };
  },
});

export default syncGeneralCatalogEntitiesInjectable;
