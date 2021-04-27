import { action, comparer, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/hotbar-store";
import * as uuid from "uuid";
import { CatalogEntityItem } from "../renderer/components/+catalog/catalog-entity.store";
import isNull from "lodash/isNull";
import { CatalogEntity } from "./catalog/catalog-entity";

export interface HotbarItem {
  entity: {
    uid: string;
  };
  params?: {
    [key: string]: string;
  }
}

export interface Hotbar {
  id: string;
  name: string;
  items: HotbarItem[];
}

export interface HotbarCreateOptions {
  id?: string;
  name: string;
  items?: HotbarItem[];
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
  }

  get activeHotbarId() {
    return this._activeHotbarId;
  }

  set activeHotbarId(id: string) {
    if (this.getById(id)) {
      this._activeHotbarId = id;
    }
  }

  get activeHotbarIndex() {
    return this.hotbars.findIndex((hotbar) => hotbar.id === this.activeHotbarId);
  }

  get initialItems() {
    return [...Array.from(Array(defaultHotbarCells).fill(null))];
  }

  @action protected async fromStore(data: Partial<HotbarStoreModel> = {}) {
    if (data.hotbars?.length === 0) {
      this.hotbars = [{
        id: uuid.v4(),
        name: "Default",
        items: this.initialItems,
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

  getActive() {
    return this.getById(this.activeHotbarId);
  }

  getByName(name: string) {
    return this.hotbars.find((hotbar) => hotbar.name === name);
  }

  getById(id: string) {
    return this.hotbars.find((hotbar) => hotbar.id === id);
  }

  add(data: HotbarCreateOptions) {
    const {
      id = uuid.v4(),
      items = this.initialItems,
      name,
    } = data;

    const hotbar = { id, name, items };

    this.hotbars.push(hotbar as Hotbar);

    return hotbar as Hotbar;
  }

  @action
  remove(hotbar: Hotbar) {
    this.hotbars = this.hotbars.filter((h) => h !== hotbar);

    if (this.activeHotbarId === hotbar.id) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  addToHotbar(item: CatalogEntityItem, cellIndex = -1) {
    const hotbar = this.getActive();
    const newItem = { entity: { uid: item.id }};

    if (hotbar.items.find(i => i?.entity.uid === item.id)) {
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

  removeFromHotbar(item: CatalogEntity) {
    const hotbar = this.getActive();
    const index = hotbar.items.findIndex((i) => i?.entity.uid === item.getId());

    if (index == -1) {
      return;
    }

    hotbar.items[index] = null;
  }

  addEmptyCell() {
    const hotbar = this.getActive();

    hotbar.items.push(null);
  }

  removeEmptyCell(index: number) {
    const hotbar = this.getActive();

    hotbar.items.splice(index, 1);
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

    return toJS(model, {
      recurseEverything: true,
    });
  }
}
