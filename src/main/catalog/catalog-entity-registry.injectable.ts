/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { CatalogEntityRegistry } from "./catalog-entity-registry";
import catalogCategoryRegistryInjectable from "../../common/catalog/catalog-category-registry.injectable";

const catalogEntityRegistryInjectable = getInjectable({
  id: "catalog-entity-registry",

  instantiate: (di) => {
    const categoryRegistryRegistry = di.inject(catalogCategoryRegistryInjectable);

    return new CatalogEntityRegistry(categoryRegistryRegistry);
  },
});

export default catalogEntityRegistryInjectable;
