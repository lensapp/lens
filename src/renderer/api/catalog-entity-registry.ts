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

import { computed, makeObservable, observable } from "mobx";
import { subscribeToBroadcast } from "../../common/ipc";
import { CatalogCategory, catalogCategoryRegistry, CatalogCategoryRegistry, CatalogEntity, CatalogEntityData, CatalogEntityKindData } from "../../common/catalog";
import "../../common/catalog-entities";
import { iter } from "../utils";
import type { Cluster } from "../../main/cluster";
import { ClusterStore } from "../../common/cluster-store";

export class CatalogEntityRegistry {
  protected rawItems = observable.array<CatalogEntityData & CatalogEntityKindData>();
  @observable.ref activeEntity?: CatalogEntity;

  constructor(private categoryRegistry: CatalogCategoryRegistry) {
    makeObservable(this);
  }

  init() {
    subscribeToBroadcast("catalog:items", (ev, items: (CatalogEntityData & CatalogEntityKindData)[]) => {
      this.rawItems.replace(items);
    });
  }

  @computed get items() {
    return Array.from(iter.filterMap(this.rawItems, rawItem => this.categoryRegistry.getEntityForData(rawItem)));
  }

  @computed get entities(): Map<string, CatalogEntity> {
    return new Map(this.items.map(item => [item.metadata.uid, item]));
  }

  getById(id: string) {
    return this.entities.get(id);
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
