/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, IComputedValue, makeObservable, observable, reaction } from "mobx";
import type { CatalogEntityRegistry } from "../../catalog/entity-registry";
import { ItemStore } from "../../../common/item.store";
import { CatalogCategory, CatalogEntity } from "../../../common/catalog";
import { autoBind, disposer } from "../../../common/utils";

export interface CatalogEntityStoreDependencies {
  readonly entityRegistry: CatalogEntityRegistry;
  readonly categories: IComputedValue<CatalogCategory[]>;
}

export class CatalogEntityStore extends ItemStore<CatalogEntity> {
  constructor(protected readonly dependencies: CatalogEntityStoreDependencies) {
    super();
    makeObservable(this);
    autoBind(this);
  }

  @observable activeCategory?: CatalogCategory;
  @observable selectedItemId?: string;

  @computed get entities() {
    if (!this.activeCategory) {
      return this.dependencies.entityRegistry.filteredItems;
    }

    return this.dependencies.entityRegistry.getItemsForCategory(this.activeCategory, { filtered: true });
  }

  @computed get selectedItem() {
    return this.entities.find(e => e.getId() === this.selectedItemId);
  }

  watch() {
    return disposer(
      reaction(() => this.entities, () => this.loadAll()),
      reaction(() => this.activeCategory, () => this.loadAll(), { delay: 100 }),
    );
  }

  loadAll() {
    if (this.activeCategory) {
      this.activeCategory.emit("load");
    } else {
      for (const category of this.dependencies.categories.get()) {
        category.emit("load");
      }
    }

    // concurrency is true to fix bug if catalog filter is removed and added at the same time
    return this.loadItems(() => this.entities, undefined, true);
  }
}
