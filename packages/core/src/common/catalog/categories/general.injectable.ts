/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { GeneralCategory } from "../../catalog-entities";
import { builtInCategoryInjectionToken } from "../category-registry.injectable";

const generalCategoryInjectable = getInjectable({
  id: "general-category",
  instantiate: () => new GeneralCategory(),
  injectionToken: builtInCategoryInjectionToken,
});

export default generalCategoryInjectable;
