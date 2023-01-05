/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import catalogCategoryRegistryInjectable from "../../common/catalog/category-registry.injectable";
import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export type { CategoryFilter } from "../../common/catalog";

export const catalogCategoryRegistry = asLegacyGlobalForExtensionApi(catalogCategoryRegistryInjectable);
