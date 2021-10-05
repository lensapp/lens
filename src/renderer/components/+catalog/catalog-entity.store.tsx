/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { computed, IReactionDisposer, makeObservable, observable, reaction } from "mobx";
import { catalogEntityRegistry as _catalogEntityRegistry, CatalogEntityRegistry } from "../../api/catalog-entity-registry";
import type { CatalogEntity } from "../../api/catalog-entity";
import type { CatalogEntityOnRunHook } from "../../api/catalog-entity-registry";
import { ItemStore } from "../../../common/item.store";
import { CatalogCategory, catalogCategoryRegistry } from "../../../common/catalog";
import { autoBind } from "../../../common/utils";
import { CatalogEntityItem } from "./catalog-entity-item";

export class CatalogEntityStore extends ItemStore<CatalogEntityItem<CatalogEntity>> {
  #catalogEntityRegistry: CatalogEntityRegistry;

  constructor(catalogEntityRegistry?: CatalogEntityRegistry) {
    super();
    makeObservable(this);
    autoBind(this);

    if (catalogEntityRegistry) {
      this.#catalogEntityRegistry = catalogEntityRegistry;
    } else {
      this.#catalogEntityRegistry = _catalogEntityRegistry;
    }
  }

  @observable activeCategory?: CatalogCategory;
  @observable selectedItemId?: string;

  @computed get entities() {
    if (!this.activeCategory) {
      return this.#catalogEntityRegistry.filteredItems.map(entity => new CatalogEntityItem(entity));
    }

    return this.#catalogEntityRegistry.getItemsForCategory(this.activeCategory, { filtered: true }).map(entity => new CatalogEntityItem(entity));
  }

  @computed get selectedItem() {
    return this.entities.find(e => e.getId() === this.selectedItemId);
  }

  getCatalogEntityOnRunHook(catalogEntityUid: CatalogEntity["metadata"]["uid"]): CatalogEntityOnRunHook | undefined {
    return this.#catalogEntityRegistry.getOnRunHook(catalogEntityUid);
  }

  watch() {
    const disposers: IReactionDisposer[] = [
      reaction(() => this.entities, () => this.loadAll()),
      reaction(() => this.activeCategory, () => this.loadAll(), { delay: 100})
    ];

    return () => disposers.forEach((dispose) => dispose());
  }

  loadAll() {
    if (this.activeCategory) {
      this.activeCategory.emit("load");
    } else {
      for (const category of catalogCategoryRegistry.items) {
        category.emit("load");
      }
    }

    return this.loadItems(() => this.entities);
  }
}
