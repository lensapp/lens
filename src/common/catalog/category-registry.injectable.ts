/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { WebLinkCategory } from "../catalog-entities";
import type { CatalogCategory } from "./catalog-entity";
import { CatalogCategoryRegistry } from "./category-registry";

export const builtInCategoryInjectionToken = getInjectionToken<CatalogCategory>({
  id: "built-in-category-token",
});

const catalogCategoryRegistryInjectable = getInjectable({
  id: "catalog-category-registry",
  instantiate: (di) => {
    const registry = new CatalogCategoryRegistry();
    const categories = di.injectMany(builtInCategoryInjectionToken);

    for (const category of categories) {
      registry.add(category);
    }

    registry.add(new WebLinkCategory());

    return registry;
  },
});

export default catalogCategoryRegistryInjectable;
