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
import { action, computed } from "mobx";
import type { CatalogEntity, CatalogEntityActionContext } from "../../api/catalog-entity";
import type { CatalogEntityOnRunHook } from "../../api/catalog-entity-registry";
import type { ItemObject } from "../../../common/item.store";
import { Badge } from "../badge";
import { navigation } from "../../navigation";
import { searchUrlParam } from "../input";
import { makeCss } from "../../../common/utils/makeCss";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { toJS } from "mobx";

const css = makeCss(styles);

const isPromise = (obj: any): obj is Promise<any> => (obj?.then && typeof obj?.then === "function") ? true: false;

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

  onRun(onRunHook: CatalogEntityOnRunHook | undefined, ctx: CatalogEntityActionContext) {
    if (!onRunHook) {
      this.entity.onRun(ctx);

      return;
    }

    if (typeof onRunHook === "function") {
      let shouldRun;

      try {
        shouldRun = onRunHook(toJS(this.entity));
      } catch (error) {
        if (process?.env?.NODE_ENV !== "test") console.warn(`[CATALOG-ENTITY-ITEM] onRunHook of entity.metadata.uid ${this.entity.metadata.uid} throw an exception, stop before onRun`, error);
      }

      if (isPromise(shouldRun)) {
        Promise.resolve(shouldRun).then((shouldRun) => {
          if (shouldRun) this.entity.onRun(ctx);
        }).catch((error) => {
          if (process?.env?.NODE_ENV !== "test") console.warn(`[CATALOG-ENTITY-ITEM] onRunHook of entity.metadata.uid ${this.entity.metadata.uid} rejects, stop before onRun`, error);
        }); 
      }  else if (shouldRun) {
        this.entity.onRun(ctx);
      }
    }
  }

  @action
  async onContextMenuOpen(ctx: any) {
    return this.entity.onContextMenuOpen(ctx);
  }
}
