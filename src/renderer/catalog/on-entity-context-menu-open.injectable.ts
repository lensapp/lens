/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { CatalogCategory, CatalogEntity, CatalogEntityContextMenuContext } from "../../common/catalog";
import { bind } from "../utils";
import getCategoryForEntityInjectable from "./get-category-for-entity.injectable";

interface Dependencies {
  getCategoryForEntity: (entity: CatalogEntity) => CatalogCategory;
}

function onEntityContextMenuOpen({ getCategoryForEntity }: Dependencies, entity: CatalogEntity, context: CatalogEntityContextMenuContext): void {
  entity.onContextMenuOpen?.(context);
  getCategoryForEntity(entity).emit("contextMenuOpen", entity, context);
}

const onEntityContextMenuOpenInjectable = getInjectable({
  instantiate: (di) => bind(onEntityContextMenuOpen, null, {
    getCategoryForEntity: di.inject(getCategoryForEntityInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default onEntityContextMenuOpenInjectable;
