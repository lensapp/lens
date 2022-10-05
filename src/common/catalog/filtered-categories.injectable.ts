/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import catalogCategoryRegistryInjectable from "./category-registry.injectable";

const filteredCategoriesInjectable = getInjectable({
  id: "filtered-categories",
  instantiate: (di) => {
    const registry = di.inject(catalogCategoryRegistryInjectable);

    return computed(() => [...registry.filteredItems]);
  },
});

export default filteredCategoriesInjectable;
