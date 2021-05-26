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

import { computed, observable, makeObservable } from "mobx";
import { subscribeToBroadcast } from "../../common/ipc";
import { iter, Singleton } from "../utils";
import type { CatalogEntity } from "./catalog-entity";
import { CatalogCategoryRegistry } from "./catalog-category-registry";
import type { CatalogCategoryRegistration } from "./catalog-categories";

export class CatalogEntityRegistry extends Singleton {
  protected rawItems = observable.array<CatalogEntity>([], { deep: true });
  @observable protected _activeEntity: CatalogEntity;

  constructor() {
    super();
    makeObservable(this);
  }

  init() {
    subscribeToBroadcast("catalog:items", (ev, items: CatalogEntity[]) => {
      this.rawItems.replace(items);
    });
  }

  set activeEntity(entity: CatalogEntity) {
    this._activeEntity = entity;
  }

  get activeEntity() {
    return this._activeEntity;
  }

  @computed get items() {
    return Array.from(iter.filter(this.rawItems, item => CatalogCategoryRegistry.getInstance().getCategoryForEntity(item)));
  }

  @computed get entities(): Map<string, CatalogEntity> {
    return new Map(this.items.map(item => [item.id, item]));
  }

  getById(id: string) {
    return this.entities.get(id);
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this.items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }

  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategoryRegistration): T[] {
    const supportedVersions = category.spec.versions.map(({ version }) => `${category.spec.group}/${version}`);
    const items = this.items.filter((item) => supportedVersions.includes(item.apiVersion) && item.kind === category.spec.names.kind);

    return items as T[];
  }
}
