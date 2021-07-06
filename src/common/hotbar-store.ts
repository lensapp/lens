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

import { action, comparer, observable, makeObservable } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/hotbar-store";
import * as uuid from "uuid";
import isNull from "lodash/isNull";
import { toJS } from "./utils";
import { CatalogEntity } from "./catalog";
import { catalogEntity } from "../main/catalog-sources/general";

export interface HotbarItem {
  entity: {
    uid: string;
    name?: string;
    source?: string;
  };
  params?: {
    [key: string]: string;
  }
}

export type Hotbar = Required<HotbarCreateOptions>;

export interface HotbarCreateOptions {
  id?: string;
  name: string;
  items?: (HotbarItem | null)[];
}

export interface HotbarStoreModel {
  hotbars: Hotbar[];
  activeHotbarId: string;
}

export const defaultHotbarCells = 12; // Number is choosen to easy hit any item with keyboard

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  @observable hotbars: Hotbar[] = [];
  @observable private _activeHotbarId: string;

  constructor() {
    super({
      configName: "lens-hotbar-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });
    makeObservable(this);
    this.load();
  }

  get activeHotbarId() {
    return this._activeHotbarId;
  }

  set activeHotbarId(id: string) {
    if (this.getById(id)) {
      this._activeHotbarId = id;
    }
  }

  hotbarIndex(id: string) {
    return this.hotbars.findIndex((hotbar) => hotbar.id === id);
  }

  get activeHotbarIndex() {
    return this.hotbarIndex(this.activeHotbarId);
  }

  static getInitialItems() {
    return [...Array.from(Array(defaultHotbarCells).fill(null))];
  }

  @action
  protected fromStore(data: Partial<HotbarStoreModel> = {}) {
    if (!data.hotbars || !data.hotbars.length) {
      this.hotbars = [{
        id: uuid.v4(),
        name: "Default",
        items: this.defaultHotbarInitialItems,
      }];
    } else {
      this.hotbars = data.hotbars;
    }

    if (data.activeHotbarId) {
      if (this.getById(data.activeHotbarId)) {
        this.activeHotbarId = data.activeHotbarId;
      }
    }

    if (!this.activeHotbarId) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  get defaultHotbarInitialItems() {
    const { metadata: { uid, name, source } } = catalogEntity;
    const initialItem = { entity: { uid, name, source }};

    return [
      initialItem,
      ...Array.from(Array(defaultHotbarCells - 1).fill(null))
    ];
  }

  getActive() {
    return this.getById(this.activeHotbarId);
  }

  getByName(name: string) {
    return this.hotbars.find((hotbar) => hotbar.name === name);
  }

  getById(id: string) {
    return this.hotbars.find((hotbar) => hotbar.id === id);
  }

  @action
  add(data: HotbarCreateOptions, { setActive = false } = {}) {
    const {
      id = uuid.v4(),
      items = HotbarStore.getInitialItems(),
      name,
    } = data;

    this.hotbars.push({ id, name, items });

    if (setActive) {
      this._activeHotbarId = id;
    }
  }

  @action
  remove(hotbar: Hotbar) {
    this.hotbars = this.hotbars.filter((h) => h !== hotbar);

    if (this.activeHotbarId === hotbar.id) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  @action
  addToHotbar(item: CatalogEntity, cellIndex = -1) {
    const hotbar = this.getActive();
    const newItem = { entity: {
      uid: item.metadata.uid,
      name: item.metadata.name,
      source: item.metadata.source
    }};

    if (hotbar.items.find(i => i?.entity.uid === item.metadata.uid)) {
      return;
    }

    if (cellIndex == -1) {
      // Add item to empty cell
      const emptyCellIndex = hotbar.items.findIndex(isNull);

      if (emptyCellIndex != -1) {
        hotbar.items[emptyCellIndex] = newItem;
      } else {
        // Add new item to the end of list
        hotbar.items.push(newItem);
      }
    } else {
      hotbar.items[cellIndex] = newItem;
    }
  }

  @action
  removeFromHotbar(uid: string): void {
    const hotbar = this.getActive();
    const index = hotbar.items.findIndex((i) => i?.entity.uid === uid);

    if (index == -1) {
      return;
    }

    hotbar.items[index] = null;
  }

  /**
   * Remvove all hotbar items that reference the `uid`.
   * @param uid The `EntityId` that each hotbar item refers to
   * @returns A function that will (in an action) undo the removing of the hotbar items. This function will not complete if the hotbar has changed.
   */
  @action
  removeAllHotbarItems(uid: string) {
    const undoItems: [Hotbar, number, HotbarItem][] = [];

    for (const hotbar of this.hotbars) {
      const index = hotbar.items.findIndex((i) => i?.entity.uid === uid);

      if (index >= 0) {
        undoItems.push([hotbar, index, hotbar.items[index]]);
        hotbar.items[index] = null;
      }
    }
  }

  findClosestEmptyIndex(from: number, direction = 1) {
    let index = from;

    while(this.getActive().items[index] != null) {
      index += direction;
    }

    return index;
  }

  restackItems(from: number, to: number): void {
    const { items } = this.getActive();
    const source = items[from];
    const moveDown = from < to;

    if (from < 0 || to < 0 || from >= items.length || to >= items.length || isNaN(from) || isNaN(to)) {
      throw new Error("Invalid 'from' or 'to' arguments");
    }

    if (from == to) {
      return;
    }

    items.splice(from, 1, null);

    if (items[to] == null) {
      items.splice(to, 1, source);
    } else {
      // Move cells up or down to closes empty cell
      items.splice(this.findClosestEmptyIndex(to, moveDown ? -1 : 1), 1);
      items.splice(to, 0, source);
    }
  }

  switchToPrevious() {
    const hotbarStore = HotbarStore.getInstance();
    let index = hotbarStore.activeHotbarIndex - 1;

    if (index < 0) {
      index = hotbarStore.hotbars.length - 1;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  switchToNext() {
    const hotbarStore = HotbarStore.getInstance();
    let index = hotbarStore.activeHotbarIndex + 1;

    if (index >= hotbarStore.hotbars.length) {
      index = 0;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  toJSON(): HotbarStoreModel {
    const model: HotbarStoreModel = {
      hotbars: this.hotbars,
      activeHotbarId: this.activeHotbarId
    };

    return toJS(model);
  }
}
