/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntityRegistry } from "./entity-registry";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../utils";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";
import type { CatalogCategoryRegistry } from "../../common/catalog";
import catalogCategoryRegistryInjectable from "./category-registry.injectable";
import { when } from "mobx";
import { isActiveRoute } from "../navigation";

interface Dependencies {
  catalogEntityRegistry: CatalogEntityRegistry;
  catalogCategoryRegistry: CatalogCategoryRegistry;
}

async function setEntityOnRouteMatch({ catalogEntityRegistry, catalogCategoryRegistry }: Dependencies) {
  await when(() => catalogEntityRegistry.entities.size > 0);

  const entities = catalogEntityRegistry.getItemsForCategory(catalogCategoryRegistry.getByName("General"));
  const activeEntity = entities.find(entity => isActiveRoute(entity.spec.path));

  if (activeEntity) {
    catalogEntityRegistry.activeEntity = activeEntity;
  }
}

const setEntityOnRouteMatchInjectable = getInjectable({
  instantiate: (di) => bind(setEntityOnRouteMatch, null, {
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default setEntityOnRouteMatchInjectable;

