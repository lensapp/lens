/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCategoryRegistryInjectable from "../../../../common/catalog/category-registry.injectable";
import navigateInjectable from "../../../navigation/navigate.injectable";
import { CatalogEntityRegistry } from "./registry";
import { loggerInjectionToken } from "@k8slens/logger";

const catalogEntityRegistryInjectable = getInjectable({
  id: "catalog-entity-registry",
  instantiate: (di) => new CatalogEntityRegistry({
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    navigate: di.inject(navigateInjectable),
    logger: di.inject(loggerInjectionToken),
  }),
});

export default catalogEntityRegistryInjectable;
