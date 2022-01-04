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

import { action, comparer, observable, makeObservable, computed } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/hotbar-store";
import { toJS } from "./utils";
import { CatalogEntity } from "./catalog";
import { catalogEntity } from "../main/catalog-sources/general";
import logger from "../main/logger";
import { broadcastMessage, HotbarTooManyItems } from "./ipc";
import { defaultHotbarCells, getEmptyHotbar, Hotbar, CreateHotbarData, CreateHotbarOptions } from "./hotbar-types";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

export interface HotbarStoreModel {
  hotbars: Hotbar[];
  activeHotbarId: string;
}

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  readonly displayName = "HotbarStore";
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

  @computed get activeHotbarId() {
    return this._activeHotbarId;
  }

  /**
   * If `hotbar` points to a known hotbar, make it active. Otherwise, ignore
   * @param hotbar The hotbar instance, or the index, or its ID
   */
  setActiveHotbar(hotbar: Hotbar | number | string) {
    if (typeof hotbar === "number") {
      if (hotbar >= 0 && hotbar < this.hotbars.length) {
        this._activeHotbarId = this.hotbars[hotbar].id;
      }
    } else if (typeof hotbar === "string") {
      if (this.getById(hotbar)) {
        this._activeHotbarId = hotbar;
      }
    } else {
      if (this.hotbars.indexOf(hotbar) >= 0) {
        this._activeHotbarId = hotbar.id;
      }
    }
  }

  private hotbarIndexById(id: string) {
    return this.hotbars.findIndex((hotbar) => hotbar.id === id);
  }

  private hotbarIndex(hotbar: Hotbar) {
    return this.hotbars.indexOf(hotbar);
  }

  @computed get activeHotbarIndex() {
    return this.hotbarIndexById(this.activeHotbarId);
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
      this.setActiveHotbar(data.activeHotbarId);
    }

    if (!this.activeHotbarId) {
      this.setActiveHotbar(0);
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

  add = action((data: CreateHotbarData, { setActive = false }: CreateHotbarOptions = {}) => {
    const hotbar = getEmptyHotbar(data.name, data.id);

    this.hotbars.push(hotbar);

    if (setActive) {
      this._activeHotbarId = hotbar.id;
    }
  });

  setHotbarName = action((id: string, name: string) => {
    const index = this.hotbars.findIndex((hotbar) => hotbar.id === id);

    if (index < 0) {
      return void console.warn(`[HOTBAR-STORE]: cannot setHotbarName: unknown id`, { id });
    }

    this.hotbars[index].name = name;
  });

  remove = action((hotbar: Hotbar) => {
    if (this.hotbars.length <= 1) {
      throw new Error("Cannot remove the last hotbar");
    }

    this.hotbars = this.hotbars.filter((h) => h !== hotbar);

    if (this.activeHotbarId === hotbar.id) {
      this.setActiveHotbar(0);
    }
  });

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

  @action
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

    hotbarStore.setActiveHotbar(index);
  }

  switchToNext() {
    const hotbarStore = HotbarStore.getInstance();
    let index = hotbarStore.activeHotbarIndex + 1;

    if (index >= hotbarStore.hotbars.length) {
      index = 0;
    }

    hotbarStore.setActiveHotbar(index);
  }

  /**
   * Checks if entity already pinned to hotbar
   * @returns boolean
   */
  isAddedToActive(entity: CatalogEntity) {
    return !!this.getActive().items.find(item => item?.entity.uid === entity.metadata.uid);
  }

  getDisplayLabel(hotbar: Hotbar): string {
    return `${this.getDisplayIndex(hotbar)}: ${hotbar.name}`;
  }

  getDisplayIndex(hotbar: Hotbar): string {
    const index = this.hotbarIndex(hotbar);

    if (index < 0) {
      return "??";
    }

    return `${index + 1}`;
  }
}

/**
 * This function ensures that there are always exactly `defaultHotbarCells`
 * worth of items in the hotbar.
 * @param hotbar The hotbar to modify
 */
function ensureExactHotbarItemLength(hotbar: Hotbar) {
  // if there are not enough items
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

const hotbarManagerInjectable = getInjectable({
  instantiate: () => HotbarStore.getInstance(),
  lifecycle: lifecycleEnum.singleton,
});

export default hotbarManagerInjectable;
