/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, makeObservable, observable, reaction } from "mobx";
import type { CatalogEntityRegistry } from "../../../api/catalog-entity-registry";
import type { CatalogEntity } from "../../../api/catalog-entity";
import { ItemStore } from "../../../../common/item.store";
import type { CatalogCategory } from "../../../../common/catalog";
import { catalogCategoryRegistry } from "../../../../common/catalog";
import { autoBind, disposer } from "../../../../common/utils";

interface Dependencies {
  registry: CatalogEntityRegistry;
}

export class CatalogEntityStore extends ItemStore<CatalogEntity> {
  constructor(private dependencies: Dependencies) {
    super();
    makeObservable(this);
    autoBind(this);
  }

  @observable activeCategory?: CatalogCategory;
  @observable selectedItemId?: string;

  @computed get entities() {
    if (!this.activeCategory) {
      return this.dependencies.registry.filteredItems;
    }

    return this.dependencies.registry.getItemsForCategory(this.activeCategory, { filtered: true });
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
      for (const category of catalogCategoryRegistry.items) {
        category.emit("load");
      }
    }

    // concurrency is true to fix bug if catalog filter is removed and added at the same time
    return this.loadItems(() => this.entities, undefined, true);
  }

  onRun(entity: CatalogEntity): void {
    this.dependencies.registry.onRun(entity);
  }
}
