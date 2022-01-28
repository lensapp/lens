/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, observable, makeObservable, computed } from "mobx";
import { BaseStore } from "../base-store";
import { toJS } from "../utils";
import { catalogEntity } from "../../main/catalog-sources/general";
import { defaultHotbarCells, getEmptyHotbar, CreateHotbarData, CreateHotbarOptions } from "./hotbar-types";
import { Hotbar } from "./hotbar";
import logger from "../logger";
import type { Migrations } from "conf/dist/source/types";

export interface HotbarStoreModel {
  hotbars: Required<CreateHotbarData>[];
  activeHotbarId: string;
}

export interface HotbarStoreDependencies {
  migrations: Migrations<HotbarStoreModel> | undefined;
}

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  readonly displayName = "HotbarStore";
  @observable hotbars: Hotbar[] = [];
  @observable private _activeHotbarId: string;

  constructor({ migrations }: HotbarStoreDependencies) {
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

      this.hotbars = [new Hotbar(hotbar, { logger })];
    } else {
      this.hotbars = data.hotbars.map(hotbar => new Hotbar(hotbar, { logger }));
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

  getByName = (name: string) => {
    return this.hotbars.find((hotbar) => hotbar.name === name);
  };

  getById(id: string) {
    return this.hotbars.find((hotbar) => hotbar.id === id);
  }

  add = action((data: CreateHotbarData, { setActive = false }: CreateHotbarOptions = {}) => {
    const hotbar = new Hotbar(getEmptyHotbar(data.name, data.id), { logger });

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

  /**
   * Remove all hotbar items that reference the `uid`.
   * @param uid The `EntityId` that each hotbar item refers to
   * @returns A function that will (in an action) undo the removing of the hotbar items. This function will not complete if the hotbar has changed.
   */
  removeAllHotbarItems = action((uid: string) => {
    for (const hotbar of this.hotbars) {
      hotbar.removeItemById(uid);
    }
  });

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
