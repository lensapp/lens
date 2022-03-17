/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { when } from "mobx";
import { catalogCategoryRegistry } from "../../../common/catalog";
import { catalogEntityRegistry } from "../catalog-entity-registry";
import { isActiveRoute } from "../../navigation";
import assert from "assert";

export async function setEntityOnRouteMatch() {
  await when(() => catalogEntityRegistry.entities.size > 0);

  const generalCategory = catalogCategoryRegistry.getByName("General");

  assert(generalCategory);
  const entities = catalogEntityRegistry.getItemsForCategory(generalCategory);
  const activeEntity = entities.find(entity => isActiveRoute(entity.spec.path));

  if (activeEntity) {
    catalogEntityRegistry.activeEntity = activeEntity;
  }
}
