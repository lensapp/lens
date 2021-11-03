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
import { toJS } from "./utils";
import { CatalogEntity } from "./catalog";
import { catalogEntity } from "../main/catalog-sources/general";
import logger from "../main/logger";
import { broadcastMessage, HotbarTooManyItems } from "./ipc";
import { defaultHotbarCells, getEmptyHotbar, Hotbar, HotbarCreateOptions } from "./hotbar-types";

export interface HotbarStoreModel {
  hotbars: Hotbar[];
  activeHotbarId: string;
}

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

  @action
  protected fromStore(data: Partial<HotbarStoreModel> = {}) {
    if (!data.hotbars || !data.hotbars.length) {
      const hotbar = getEmptyHotbar("Default");
      const { metadata: { uid, name, source }} = catalogEntity;
      const initialItem = { entity: { uid, name, source }};

      hotbar.items[0] = initialItem;

      this.hotbars = [hotbar];
    } else {
      this.hotbars = data.hotbars;
    }

    this.hotbars.forEach(ensureExactHotbarItemLength);

    if (data.activeHotbarId) {
      if (this.getById(data.activeHotbarId)) {
        this.activeHotbarId = data.activeHotbarId;
      }
    }

    if (!this.activeHotbarId) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  toJSON(): HotbarStoreModel {
    const model: HotbarStoreModel = {
      hotbars: this.hotbars,
      activeHotbarId: this.activeHotbarId,
    };

    return toJS(model);
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
    const hotbar = getEmptyHotbar(data.name, data.id);

    this.hotbars.push(hotbar);

    if (setActive) {
      this._activeHotbarId = hotbar.id;
    }
  }

  @action
  setHotbarName(id: string, name: string) {
    const index = this.hotbars.findIndex((hotbar) => hotbar.id === id);

    if(index < 0) {
      console.warn(`[HOTBAR-STORE]: cannot setHotbarName: unknown id`, { id });

      return;
    }

    this.hotbars[index].name = name;
  }

  @action
  remove(hotbar: Hotbar) {
    this.hotbars = this.hotbars.filter((h) => h !== hotbar);

    if (this.activeHotbarId === hotbar.id) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  @action
  addToHotbar(item: CatalogEntity, cellIndex?: number) {
    const hotbar = this.getActive();
    const uid = item.metadata?.uid;
    const name = item.metadata?.name;

    if (typeof uid !== "string") {
      throw new TypeError("CatalogEntity.metadata.uid must be a string");
    }

    if (typeof name !== "string") {
      throw new TypeError("CatalogEntity.metadata.name must be a string");
    }

    const newItem = { entity: {
      uid,
      name,
      source: item.metadata.source,
    }};


    if (this.isAddedToActive(item)) {
      return;
    }

    if (cellIndex === undefined) {
      // Add item to empty cell
      const emptyCellIndex = hotbar.items.indexOf(null);

      if (emptyCellIndex != -1) {
        hotbar.items[emptyCellIndex] = newItem;
      } else {
        broadcastMessage(HotbarTooManyItems);
      }
    } else if (0 <= cellIndex && cellIndex < hotbar.items.length) {
      hotbar.items[cellIndex] = newItem;
    } else {
      logger.error(`[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range`, { entityId: uid, hotbarId: hotbar.id, cellIndex });
    }
  }

  @action
  removeFromHotbar(uid: string): void {
    const hotbar = this.getActive();
    const index = hotbar.items.findIndex(item => item?.entity.uid === uid);

    if (index < 0) {
      return;
    }

    hotbar.items[index] = null;
  }

  /**
   * Remove all hotbar items that reference the `uid`.
   * @param uid The `EntityId` that each hotbar item refers to
   * @returns A function that will (in an action) undo the removing of the hotbar items. This function will not complete if the hotbar has changed.
   */
  @action
  removeAllHotbarItems(uid: string) {
    for (const hotbar of this.hotbars) {
      const index = hotbar.items.findIndex((i) => i?.entity.uid === uid);

      if (index >= 0) {
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

  /**
   * Checks if entity already pinned to hotbar
   * @returns boolean
   */
  isAddedToActive(entity: CatalogEntity) {
    return !!this.getActive().items.find(item => item?.entity.uid === entity.metadata.uid);
  }
}

/**
 * This function ensures that there are always exactly `defaultHotbarCells`
 * worth of items in the hotbar.
 * @param hotbar The hotbar to modify
 */
function ensureExactHotbarItemLength(hotbar: Hotbar) {
  if (hotbar.items.length === defaultHotbarCells) {
    // if we already have `defaultHotbarCells` then we are good to stop
    return;
  }

  // otherwise, keep adding empty entries until full
  while (hotbar.items.length < defaultHotbarCells) {
    hotbar.items.push(null);
  }

  // if for some reason the hotbar was overfilled before, remove as many entries
  // as needed, but prefer empty slots and items at the end first.
  while (hotbar.items.length > defaultHotbarCells) {
    const lastNull = hotbar.items.lastIndexOf(null);

    if (lastNull >= 0) {
      hotbar.items.splice(lastNull, 1);
    } else {
      hotbar.items.length = defaultHotbarCells;
    }
  }
}
