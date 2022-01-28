/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { CatalogEntityRegistry } from "./catalog-entity-registry";
import extensionSourcedEntitiesInjectable from "./extension-sourced-entities.injectable";
import getCategoryForEntityInjectable from "./get-category-for-entity.injectable";

const catalogEntityRegistryInjectable = getInjectable({
  instantiate: (di) => new CatalogEntityRegistry({
    getCategoryForEntity: di.inject(getCategoryForEntityInjectable),
    extensionSourcedEntities: di.inject(extensionSourcedEntitiesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntityRegistryInjectable;
