/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogCategoryRegistryInjectable from "./category-registry.injectable";

const getCategoryByNameInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogCategoryRegistryInjectable).getByName,
  lifecycle: lifecycleEnum.singleton,
});

export default getCategoryByNameInjectable;
