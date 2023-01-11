/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WebLinkCategory } from "../../catalog-entities";
import { builtInCategoryInjectionToken } from "../category-registry.injectable";

const weblinkCategoryInjectable = getInjectable({
  id: "weblink-category",
  instantiate: () => new WebLinkCategory(),
  injectionToken: builtInCategoryInjectionToken,
});

export default weblinkCategoryInjectable;
