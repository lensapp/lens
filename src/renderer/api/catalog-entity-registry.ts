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

export class CatalogEntityRegistry {
  @observable.ref activeEntity: CatalogEntity;
  protected _entities = observable.map<string, CatalogEntity>([], { deep: true });

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

  @computed get entities(): Map<string, CatalogEntity> {
    this.processRawEntities();

    return this._entities;
  }

  getById<T extends CatalogEntity>(id: string) {
    return this.entities.get(id) as T;
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }

  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[] {
    const supportedVersions = category.spec.versions.map((v) => `${category.spec.group}/${v.name}`);
    const items = this.items.filter((item) => supportedVersions.includes(item.apiVersion) && item.kind === category.spec.names.kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);

export function getActiveClusterEntity(): Cluster | undefined {
  return ClusterStore.getInstance().getById(catalogEntityRegistry.activeEntity?.getId());
}
