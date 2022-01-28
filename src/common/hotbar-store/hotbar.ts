/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { action } from "mobx";
import type { CatalogEntity } from "../catalog";
import { broadcastMessage, HotbarTooManyItems } from "../ipc";
import type { LensLogger } from "../logger";
import type { Tuple } from "../utils";
import type { HotbarItem, defaultHotbarCells, CreateHotbarData } from "./hotbar-types";

export interface HotbarDependencies {
  readonly logger: LensLogger;
}

export class Hotbar {
  public readonly id: string;
  public name: string;
  public readonly items: Tuple<HotbarItem | null, typeof defaultHotbarCells>;

  constructor(data: Required<CreateHotbarData>, protected readonly dependencies: HotbarDependencies) {
    this.id = data.id;
    this.name = data.name;
    this.items = data.items;
  }

  setName = (name: string) => {
    this.name = name;
  };

  addItem = action((item: CatalogEntity, cellIndex?: number) => {
    const uid = item.getId();
    const name = item.getName();

    if (typeof uid !== "string") {
      throw new TypeError("item's id must be a string");
    }

    if (typeof name !== "string") {
      throw new TypeError("item's name must be a string");
    }

    const newItem = { entity: {
      uid,
      name,
      source: item.metadata.source,
    }};


    if (this.hasItem(item)) {
      return;
    }

    if (cellIndex === undefined) {
      // Add item to empty cell
      const emptyCellIndex = this.items.indexOf(null);

      if (emptyCellIndex != -1) {
        this.items[emptyCellIndex] = newItem;
      } else {
        broadcastMessage(HotbarTooManyItems);
      }
    } else if (0 <= cellIndex && cellIndex < this.items.length) {
      this.items[cellIndex] = newItem;
    } else {
      this.dependencies.logger.error(`[HOTBAR-${this.id}]: cannot pin entity to hotbar outside of index range`, { entityId: uid, cellIndex });
    }
  });

  private findClosestEmptyIndex(from: number, direction = 1) {
    let index = from;

    while(this.items[index] != null) {
      index += direction;
    }

    return index;
  }

  /**
   * Checks if entity already pinned to hotbar
   * @returns boolean
   */
  hasItem = (entity: CatalogEntity): boolean => {
    return this.items.findIndex(item => item?.entity.uid === entity.metadata.uid) >= 0;
  };

  removeItemById = action((uid: string): void => {
    const index = this.items.findIndex(item => item?.entity.uid === uid);

    if (index < 0) {
      return;
    }

    this.items[index] = null;
  });

  restackItems = action((from: number, to: number): void => {
    const { items } = this;
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
  });
}
