/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, observable, makeObservable, computed, runInAction } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/hotbar-store";
import { toJS } from "./utils";
import type { CatalogEntity } from "./catalog";
import logger from "../main/logger";
import { broadcastMessage } from "./ipc";
import type {
  Hotbar,
  CreateHotbarData,
  CreateHotbarOptions } from "./hotbar-types";
import {
  defaultHotbarCells,
  getEmptyHotbar,
} from "./hotbar-types";
import { hotbarTooManyItemsChannel } from "./ipc/hotbar";
import type { GeneralEntity } from "./catalog-entities";

export interface HotbarStoreModel {
  hotbars: Hotbar[];
  activeHotbarId: string;
}

interface Dependencies {
  catalogCatalogEntity: GeneralEntity;
}

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  readonly displayName = "HotbarStore";
  @observable hotbars: Hotbar[] = [];
  @observable private _activeHotbarId!: string;

  constructor(private dependencies: Dependencies) {
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
      const {
        metadata: { uid, name, source },
      } = this.dependencies.catalogCatalogEntity;
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

  getActive(): Hotbar {
    const hotbar = this.getById(this.activeHotbarId);

    if (hotbar) {
      return hotbar;
    }

    runInAction(() => {
      if (this.hotbars.length === 0) {
        this.hotbars.push(getEmptyHotbar("Default"));
      }

      this._activeHotbarId = this.hotbars[0].id;
    });

    return this.hotbars[0];
  }

  getByName(name: string) {
    return this.hotbars.find((hotbar) => hotbar.name === name);
  }

  getById(id: string) {
    return this.hotbars.find((hotbar) => hotbar.id === id);
  }

  add = action(
    (
      data: CreateHotbarData,
      { setActive = false }: CreateHotbarOptions = {},
    ) => {
      const hotbar = getEmptyHotbar(data.name, data.id);

      this.hotbars.push(hotbar);

      if (setActive) {
        this._activeHotbarId = hotbar.id;
      }
    },
  );

  setHotbarName = action((id: string, name: string): void => {
    const index = this.hotbars.findIndex((hotbar) => hotbar.id === id);

    if (index < 0) {
      return void console.warn(
        `[HOTBAR-STORE]: cannot setHotbarName: unknown id`,
        { id },
      );
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
    const uid = item.getId();
    const name = item.getName();

    if (typeof uid !== "string") {
      throw new TypeError("CatalogEntity's ID must be a string");
    }

    if (typeof name !== "string") {
      throw new TypeError("CatalogEntity's NAME must be a string");
    }

    if (this.isAddedToActive(item)) {
      return;
    }

    const entity = {
      uid,
      name,
      source: item.metadata.source,
    };
    const newItem = { entity };

    if (cellIndex === undefined) {
      // Add item to empty cell
      const emptyCellIndex = hotbar.items.indexOf(null);

      if (emptyCellIndex != -1) {
        hotbar.items[emptyCellIndex] = newItem;
      } else {
        broadcastMessage(hotbarTooManyItemsChannel);
      }
    } else if (0 <= cellIndex && cellIndex < hotbar.items.length) {
      hotbar.items[cellIndex] = newItem;
    } else {
      logger.error(
        `[HOTBAR-STORE]: cannot pin entity to hotbar outside of index range`,
        { entityId: uid, hotbarId: hotbar.id, cellIndex },
      );
    }
  }

  @action
  removeFromHotbar(uid: string): void {
    const hotbar = this.getActive();
    const index = hotbar.items.findIndex((item) => item?.entity.uid === uid);

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

    while (this.getActive().items[index] != null) {
      index += direction;
    }

    return index;
  }

  @action
  restackItems(from: number, to: number): void {
    const { items } = this.getActive();
    const source = items[from];
    const moveDown = from < to;

    if (
      from < 0 ||
      to < 0 ||
      from >= items.length ||
      to >= items.length ||
      isNaN(from) ||
      isNaN(to)
    ) {
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
    let index = this.activeHotbarIndex - 1;

    if (index < 0) {
      index = this.hotbars.length - 1;
    }

    this.setActiveHotbar(index);
  }

  switchToNext() {
    let index = this.activeHotbarIndex + 1;

    if (index >= this.hotbars.length) {
      index = 0;
    }

    this.setActiveHotbar(index);
  }

  /**
   * Checks if entity already pinned to the active hotbar
   */
  isAddedToActive(entity: CatalogEntity | null | undefined): boolean {
    if (!entity) {
      return false;
    }

    return (
      this.getActive().items.findIndex(
        (item) => item?.entity.uid === entity.getId(),
      ) >= 0
    );
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
