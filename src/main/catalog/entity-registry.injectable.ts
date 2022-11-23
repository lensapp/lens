/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hasCategoryForEntityInjectable from "../../common/catalog/has-category-for-entity.injectable";
import { CatalogEntityRegistry } from "./entity-registry";
import catalogEntitiesInjectable
  from "./catalog-entities-from-features/catalog-entities.injectable";

const catalogEntityRegistryInjectable = getInjectable({
  id: "catalog-entity-registry",

  instantiate: (di) => new CatalogEntityRegistry({
    hasCategoryForEntity: di.inject(hasCategoryForEntityInjectable),
    decoupledCatalogEntities: di.inject(catalogEntitiesInjectable),
  }),
});

export default catalogEntityRegistryInjectable;
