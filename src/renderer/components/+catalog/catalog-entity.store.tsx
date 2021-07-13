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

import styles from "./catalog.module.css";

import React from "react";
import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from "mobx";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import type { CatalogEntity, CatalogEntityActionContext } from "../../api/catalog-entity";
import { ItemObject, ItemStore } from "../../item.store";
import { CatalogCategory, catalogCategoryRegistry } from "../../../common/catalog";
import { autoBind } from "../../../common/utils";
import { Badge } from "../badge";
import { navigation } from "../../navigation";
import { searchUrlParam } from "../input";
import { makeCss } from "../../../common/utils/makeCss";
import { KubeObject } from "../../api/kube-object";

const css = makeCss(styles);

export class CatalogEntityItem<T extends CatalogEntity> implements ItemObject {
  constructor(public entity: T) {}

  get kind() {
    return this.entity.kind;
  }

  get apiVersion() {
    return this.entity.apiVersion;
  }

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

  get enabled() {
    return this.entity.status.enabled ?? true;
  }

  get labels() {
    return KubeObject.stringifyLabels(this.entity.metadata.labels);
  }

  getLabelBadges(onClick?: React.MouseEventHandler<any>) {
    return this.labels
      .map(label => (
        <Badge
          className={css.badge}
          key={label}
          label={label}
          title={label}
          onClick={(event) => {
            navigation.searchParams.set(searchUrlParam.name, label);
            onClick?.(event);
            event.stopPropagation();
          }}
          expandable={false}
        />
      ));
  }

  get source() {
    return this.entity.metadata.source || "unknown";
  }

  get searchFields() {
    return [
      this.name,
      this.id,
      this.phase,
      `source=${this.source}`,
      ...this.labels,
    ];
  }

  onRun(ctx: CatalogEntityActionContext) {
    this.entity.onRun(ctx);
  }

  @action
  async onContextMenuOpen(ctx: any) {
    return this.entity.onContextMenuOpen(ctx);
  }
}

export class CatalogEntityStore extends ItemStore<CatalogEntityItem<CatalogEntity>> {
  constructor() {
    super();
    makeObservable(this);
    autoBind(this);
  }

  @observable activeCategory?: CatalogCategory;
  @observable selectedItemId?: string;

  @computed get entities() {
    if (!this.activeCategory) {
      return catalogEntityRegistry.items.map(entity => new CatalogEntityItem(entity));
    }

    return catalogEntityRegistry.getItemsForCategory(this.activeCategory).map(entity => new CatalogEntityItem(entity));
  }

  @computed get selectedItem() {
    return this.entities.find(e => e.getId() === this.selectedItemId);
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
