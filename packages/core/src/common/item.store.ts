/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import orderBy from "lodash/orderBy";
import { autoBind } from "./utils";
import { action, computed, observable, when, makeObservable } from "mobx";

export interface ItemObject {
  getId(): string;
  getName(): string;
}

export abstract class ItemStore<Item extends ItemObject> {
  protected defaultSorting = (item: Item) => item.getName();

  @observable failedLoading = false;
  @observable isLoading = false;
  @observable isLoaded = false;
  @observable items = observable.array<Item>([], { deep: false });
  @observable selectedItemsIds = observable.set<string>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  @computed get selectedItems(): Item[] {
    return this.pickOnlySelected(this.items);
  }

  public pickOnlySelected(items: Item[]): Item[] {
    return items.filter(item => this.selectedItemsIds.has(item.getId()));
  }

  public getItems(): Item[] {
    return Array.from(this.items);
  }

  public getTotalCount(): number {
    return this.items.length;
  }

  getByName(name: string): Item | undefined {
    return this.items.find(item => item.getName() === name);
  }

  getIndexById(id: string): number {
    return this.items.findIndex(item => item.getId() === id);
  }

  /**
   * Return `items` sorted by the given ordering functions. If two elements of
   * `items` are sorted to the same "index" then the next sorting function is used
   * to determine where to place them relative to each other. Once the `sorting`
   * functions have been all exhausted then the order is unchanged (ie a stable sort).
   * @param items the items to be sorted (default: the current items in this store)
   * @param sorting list of functions to determine sort order (default: sorting by name)
   * @param order whether to sort from least to greatest (`"asc"` (default)) or vice-versa (`"desc"`)
   */
  @action
  protected sortItems(items: Item[] = this.items, sorting: ((item: Item) => any)[] = [this.defaultSorting], order?: "asc" | "desc"): Item[] {
    return orderBy(items, sorting, order);
  }

  protected async createItem(...args: any[]): Promise<any>;
  @action
  protected async createItem(request: () => Promise<Item>) {
    const newItem = await request();
    const item = this.items.find(item => item.getId() === newItem.getId());

    if (item) {
      return item;
    } else {
      const items = this.sortItems([...this.items, newItem]);

      this.items.replace(items);

      return newItem;
    }
  }

  protected async loadItems(...args: any[]): Promise<any>;
  /**
   * Load items to this.items
   * @param request Function to return the items to be loaded.
   * @param sortItems If true, items will be sorted.
   * @param concurrency If true, concurrent loadItems() calls will all be executed. If false, only the first.
   * @returns
   */
  @action
  protected async loadItems(request: () => Promise<Item[] | any>, sortItems = true, concurrency = false) {
    if (this.isLoading) {
      await when(() => !this.isLoading);

      // If concurrency for loading is disabled, return instead of loading
      if (!concurrency) {
        return;
      }
    }
    this.isLoading = true;

    try {
      let items = await request();

      if (sortItems) items = this.sortItems(items);
      this.items.replace(items);
      this.isLoaded = true;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  protected async loadItem(request: () => Promise<Item>, sortItems = true) {
    const item = await Promise.resolve(request()).catch(() => null);

    if (item) {
      const existingItem = this.items.find(el => el.getId() === item.getId());

      if (existingItem) {
        const index = this.items.findIndex(item => item === existingItem);

        this.items.splice(index, 1, item);
      } else {
        let items = [...this.items, item];

        if (sortItems) items = this.sortItems(items);
        this.items.replace(items);
      }
    }

    return item;
  }

  @action
  protected async updateItem(item: Item, request: () => Promise<Item>) {
    const updatedItem = await request();
    const index = this.items.findIndex(i => i.getId() === item.getId());

    this.items.splice(index, 1, updatedItem);

    return updatedItem;
  }

  @action
  protected async removeItem(item: Item, request: () => Promise<any>) {
    await request();
    this.items.remove(item);
    this.selectedItemsIds.delete(item.getId());
  }

  isSelected(item: Item) {
    return this.selectedItemsIds.has(item.getId());
  }

  @action
  select(item: Item) {
    this.selectedItemsIds.add(item.getId());
  }

  @action
  unselect(item: Item) {
    this.selectedItemsIds.delete(item.getId());
  }

  @action
  toggleSelection(item: Item) {
    if (this.isSelected(item)) {
      this.unselect(item);
    } else {
      this.select(item);
    }
  }

  @action
  toggleSelectionAll(visibleItems: Item[] = this.items) {
    const allSelected = visibleItems.every(this.isSelected);

    if (allSelected) {
      visibleItems.forEach(this.unselect);
    } else {
      visibleItems.forEach(this.select);
    }
  }

  isSelectedAll(visibleItems: Item[] = this.items) {
    if (!visibleItems.length) return false;

    return visibleItems.every(this.isSelected);
  }

  @action
  resetSelection() {
    this.selectedItemsIds.clear();
  }

  @action
  reset() {
    this.resetSelection();
    this.items.clear();
    this.selectedItemsIds.clear();
    this.isLoaded = false;
    this.isLoading = false;
  }

  async removeSelectedItems?(): Promise<any>;

  async removeItems?(items: Item[]): Promise<void>;

  * [Symbol.iterator]() {
    yield* this.items;
  }
}
