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
import { computed, IReactionDisposer, observable, reaction } from "mobx";
import type { CatalogEntity, ActionContext, MenuContext, CatalogCategorySpec } from "../../api/catalog-entity";
import { CatalogEntityRegistry } from "../../api/catalog-entity-registry";
import { ItemObject, ItemStore } from "../../item.store";
import { autobind } from "../../utils";

export class CatalogEntityItem implements ItemObject {
  constructor(public entity: CatalogEntity) {}

  get name() {
    return this.entity.metadata.name;
  }

  getName() {
    return this.entity.metadata.name;
  }

  get id() {
    return this.entity.metadata.uid;
  }

  getId() {
    return this.id;
  }

  @computed get phase() {
    return this.entity.status.phase;
  }

  get labels() {
    const labels: string[] = [];

    Object.keys(this.entity.metadata.labels).forEach((key) => {
      const value = this.entity.metadata.labels[key];

      labels.push(`${key}=${value}`);
    });

    return labels;
  }

  get source() {
    return this.entity.metadata.source || "unknown";
  }

  get searchFields() {
    return [
      this.name,
      this.id,
      this.phase,
      ...this.labels.map((value, key) => `${key}=${value}`)
    ];
  }

  onRun(ctx: ActionContext) {
    this.entity.onRun(ctx);
  }

  onContextMenuOpen(ctx: MenuContext) {
    return this.entity.onContextMenuOpen(ctx);
  }
}

@autobind()
export class CatalogEntityStore extends ItemStore<CatalogEntityItem> {
  @observable activeCategory?: CatalogCategorySpec;

  @computed get entities() {
    const registry = CatalogEntityRegistry.getInstance();

    if (!this.activeCategory) {
      return registry.items.map(entity => new CatalogEntityItem(entity));
    }

    return registry.getItemsForCategory(this.activeCategory).map(entity => new CatalogEntityItem(entity));
  }

  watch() {
    const disposers: IReactionDisposer[] = [
      reaction(() => this.entities, () => this.loadAll()),
      reaction(() => this.activeCategory, () => this.loadAll(), { delay: 100})
    ];

    return () => disposers.forEach((dispose) => dispose());
  }

  loadAll() {
    return this.loadItems(() => this.entities);
  }
}
