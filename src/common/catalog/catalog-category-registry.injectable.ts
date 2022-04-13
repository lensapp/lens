/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { catalogCategoryRegistry } from "./catalog-category-registry";

const catalogCategoryRegistryInjectable = getInjectable({
  id: "catalog-category-registry",
  instantiate: () => catalogCategoryRegistry,
  causesSideEffects: true,
});

export default catalogCategoryRegistryInjectable;
