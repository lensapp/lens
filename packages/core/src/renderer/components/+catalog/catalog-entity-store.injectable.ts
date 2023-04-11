/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";

import type { IComputedValue, IObservableValue } from "mobx";
import { computed, observable, reaction } from "mobx";
import type { CatalogEntity } from "../../api/catalog-entity";
import type { CatalogCategory } from "../../../common/catalog";
import type { Disposer } from "@k8slens/utilities";
import { disposer } from "@k8slens/utilities";
import type { ItemListStore } from "../item-object-list";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import selectedCatalogEntityParamInjectable from "./entity-details/selected-uid.injectable";

export type CatalogEntityStore = ItemListStore<CatalogEntity, false> & {
  readonly entities: IComputedValue<CatalogEntity[]>;
  readonly activeCategory: IObservableValue<CatalogCategory | undefined>;
  watch(): Disposer;
  onRun(entity: CatalogEntity): void;
};

const catalogEntityStoreInjectable = getInjectable({
  id: "catalog-entity-store",

  instantiate: (di): CatalogEntityStore => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
    const catalogCategoryRegistry = di.inject(catalogCategoryRegistryInjectable);
    const selectedCatalogEntityParam = di.inject(selectedCatalogEntityParamInjectable);

    const activeCategory = observable.box<CatalogCategory>();
    const entities = computed(() => {
      const category = activeCategory.get();

      return category
        ? catalogEntityRegistry.getItemsForCategory(category, { filtered: true })
        : catalogEntityRegistry.filteredItems;
    });
    const loadAll = () => {
      const category = activeCategory.get();

      if (category) {
        category.emit("load");
      } else {
        for (const category of catalogCategoryRegistry.items) {
          category.emit("load");
        }
      }
    };

    return {
      entities,
      activeCategory,
      watch: () => disposer(
        reaction(() => entities.get(), loadAll),
        reaction(() => activeCategory.get(), loadAll, { delay: 100 }),
      ),
      onRun: entity => catalogEntityRegistry.onRun(entity),
      failedLoading: false,
      getTotalCount: () => entities.get().length,
      isLoaded: true,
      isSelected: (item) => item.getId() === selectedCatalogEntityParam.get(),
      isSelectedAll: () => false,
      pickOnlySelected: () => [],
      toggleSelection: () => {},
      toggleSelectionAll: () => {},
      removeSelectedItems: async () => {},
    };
  },
});

export default catalogEntityStoreInjectable;
