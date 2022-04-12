/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity, CatalogEntityContextMenuContext } from "./catalog-entity";
import catalogCategoryRegistryInjectable from "./category-registry.injectable";

export type OnContextMenuOpen = (entity: CatalogEntity, context: CatalogEntityContextMenuContext) => void;

const onContextMenuOpenInjectable = getInjectable({
  id: "on-context-menu-open",
  instantiate: (di): OnContextMenuOpen => {
    const categoryRegistry = di.inject(catalogCategoryRegistryInjectable);

    return (entity, context) => {
      entity.onContextMenuOpen?.(context);
      categoryRegistry.getCategoryForEntity(entity)?.emit("contextMenuOpen", entity, context);
    };
  },
});

export default onContextMenuOpenInjectable;
