/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogCategoriesInjectable from "../../catalog/categories.injectable";
import catalogEntityRegistryInjectable from "../../catalog/entity-registry.injectable";
import { CatalogEntityStore } from "./entity.store";

const catalogEntityStoreInjectable = getInjectable({
  instantiate: (di) => new CatalogEntityStore({
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    categories: di.inject(catalogCategoriesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntityStoreInjectable;
