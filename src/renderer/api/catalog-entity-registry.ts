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

import { computed, observable, makeObservable, action } from "mobx";
import { ipcRendererOn } from "../../common/ipc";
import { CatalogCategory, CatalogEntity, CatalogEntityData, catalogCategoryRegistry, CatalogCategoryRegistry, CatalogEntityKindData } from "../../common/catalog";
import "../../common/catalog-entities";
import type { Cluster } from "../../main/cluster";
import { ClusterStore } from "../../common/cluster-store";
import { Disposer, iter } from "../utils";
import { once } from "lodash";

export type EntityFilter = (entity: CatalogEntity) => any;

export class CatalogEntityRegistry {
  @observable.ref activeEntity: CatalogEntity;
  protected _entities = observable.map<string, CatalogEntity>([], { deep: true });
  protected filters = observable.set<EntityFilter>([], {
    deep: false,
  });

  /**
   * Buffer for keeping entities that don't yet have CatalogCategory synced
   */
  protected rawEntities: (CatalogEntityData & CatalogEntityKindData)[] = [];

  constructor(private categoryRegistry: CatalogCategoryRegistry) {
    makeObservable(this);
  }

  init() {
    ipcRendererOn("catalog:items", (event, items: (CatalogEntityData & CatalogEntityKindData)[]) => {
      this.updateItems(items);
    });
  }

  @action updateItems(items: (CatalogEntityData & CatalogEntityKindData)[]) {
    this.rawEntities.length = 0;

    const newIds = new Set(items.map((item) => item.metadata.uid));

    for (const uid of this._entities.keys()) {
      if (!newIds.has(uid)) {
        this._entities.delete(uid);
      }
    }

    for (const item of items) {
      this.updateItem(item);
    }
  }

  @action protected updateItem(item: (CatalogEntityData & CatalogEntityKindData)) {
    const existing = this._entities.get(item.metadata.uid);

    if (!existing) {
      const entity = this.categoryRegistry.getEntityForData(item);

      if (entity) {
        this._entities.set(entity.metadata.uid, entity);
      } else {
        this.rawEntities.push(item);
      }
    } else {
      existing.metadata = item.metadata;
      existing.spec = item.spec;
      existing.status = item.status;
    }
  }

  protected processRawEntities() {
    const items = [...this.rawEntities];

    this.rawEntities.length = 0;

    for (const item of items) {
      this.updateItem(item);
    }
  }

  @computed get items() {
    this.processRawEntities();

    return Array.from(this._entities.values());
  }

  @computed get filteredItems() {
    return Array.from(
      iter.reduce(
        this.filters,
        iter.filter,
        this.items,
      )
    );
  }

  @computed get entities(): Map<string, CatalogEntity> {
    return new Map(
      this.items.map(entity => [entity.getId(), entity])
    );
  }

  @computed get filteredEntities(): Map<string, CatalogEntity> {
    return new Map(
      this.filteredItems.map(entity => [entity.getId(), entity])
    );
  }

  getById<T extends CatalogEntity>(id: string) {
    return this.entities.get(id) as T;
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string, { filtered = false } = {}): T[] {
    const byApiKind = (item: CatalogEntity) => item.apiVersion === apiVersion && item.kind === kind;
    const entities = filtered ? this.filteredItems : this.items;

    return entities.filter(byApiKind) as T[];
  }

  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory, { filtered = false } = {}): T[] {
    const supportedVersions = new Set(category.spec.versions.map((v) => `${category.spec.group}/${v.name}`));
    const byApiVersionKind = (item: CatalogEntity) => supportedVersions.has(item.apiVersion) && item.kind === category.spec.names.kind;
    const entities = filtered ? this.filteredItems : this.items;

    return entities.filter(byApiVersionKind) as T[];
  }

  /**
   * Add a new filter to the set of item filters
   * @param fn The function that should return a truthy value if that entity should be sent currently "active"
   * @returns A function to remove that filter
   */
  addCatalogFilter(fn: EntityFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);

export function getActiveClusterEntity(): Cluster | undefined {
  return ClusterStore.getInstance().getById(catalogEntityRegistry.activeEntity?.getId());
}
