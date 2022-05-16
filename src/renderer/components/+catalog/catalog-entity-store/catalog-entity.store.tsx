/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue, IObservableValue } from "mobx";
import { computed, observable, reaction } from "mobx";
import type { CatalogEntityRegistry } from "../../../api/catalog/entity/registry";
import type { CatalogEntity } from "../../../api/catalog-entity";
import type { CatalogCategory, CatalogCategoryRegistry } from "../../../../common/catalog";
import type { Disposer } from "../../../../common/utils";
import { disposer } from "../../../../common/utils";
import type { ItemListStore } from "../../item-object-list";

interface Dependencies {
  entityRegistry: CatalogEntityRegistry;
  catalogRegistry: CatalogCategoryRegistry;
}

export type CatalogEntityStore = ItemListStore<CatalogEntity, false> & {
  readonly entities: IComputedValue<CatalogEntity[]>;
  readonly activeCategory: IObservableValue<CatalogCategory | undefined>;
  readonly selectedItemId: IObservableValue<string | undefined>;
  readonly selectedItem: IComputedValue<CatalogEntity | undefined>;
  watch(): Disposer;
  onRun(entity: CatalogEntity): void;
};

export function catalogEntityStore({
  entityRegistry,
  catalogRegistry,
}: Dependencies): CatalogEntityStore {
  const activeCategory = observable.box<CatalogCategory | undefined>(undefined);
  const selectedItemId = observable.box<string | undefined>(undefined);
  const entities = computed(() => {
    const category = activeCategory.get();

    return category
      ? entityRegistry.getItemsForCategory(category, { filtered: true })
      : entityRegistry.filteredItems;
  });
  const selectedItem = computed(() => {
    const id = selectedItemId.get();

    if (!id) {
      return undefined;
    }

    return entities.get().find(entity => entity.getId() === id);
  });
  const loadAll = () => {
    const category = activeCategory.get();

    if (category) {
      category.emit("load");
    } else {
      for (const category of catalogRegistry.items) {
        category.emit("load");
      }
    }
  };

  return {
    entities,
    selectedItem,
    activeCategory,
    selectedItemId,
    watch: () => disposer(
      reaction(() => entities.get(), loadAll),
      reaction(() => activeCategory.get(), loadAll, { delay: 100 }),
    ),
    onRun: entity => entityRegistry.onRun(entity),
    failedLoading: false,
    getTotalCount: () => entityRegistry.filteredItems.length,
    isLoaded: true,
    isSelected: (item) => item.getId() === selectedItemId.get(),
    isSelectedAll: () => false,
    pickOnlySelected: () => [],
    toggleSelection: () => {},
    toggleSelectionAll: () => {},
    removeSelectedItems: async () => {},
  };
}
