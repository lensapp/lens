/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";

export interface CustomCatalogCategoryRegistration {
  kind: string;
  group: string;
  registration: RegisteredAdditionalCategoryColumn;
}

export const customCatalogCategoryColumnInjectionToken = getInjectionToken<CustomCatalogCategoryRegistration>({
  id: "custom-catalog-category-column-token",
});
