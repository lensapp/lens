/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { type IObservableValue, type IObservableArray, observable, runInAction, toJS } from "mobx";
import type { CatalogEntity } from "../../../../common/catalog";
import { getShortName } from "../../../../common/catalog/helpers";
import type { HotbarItem, CreateHotbarData } from "./types";
import { defaultHotbarCells } from "./types";
import { broadcastMessage } from "../../../../common/ipc";
import { hotbarTooManyItemsChannel } from "../../../../common/ipc/hotbar";
import * as uuid from "uuid";
import type { Logger } from "@k8slens/logger";
import { tuple } from "@k8slens/utilities";

export interface HotbarDependencies {
  readonly logger: Logger;
}

export interface HotbarData {
  readonly id: string;
  readonly name: string;
  readonly items: (HotbarItem | null)[];
}

export class Hotbar {
  readonly id: string;
  readonly name: IObservableValue<string>;
  readonly items: IObservableArray<HotbarItem | null>;

  constructor(private readonly dependencies: HotbarDependencies, data: CreateHotbarData) {
    this.id = data.id ?? uuid.v4();
    this.name = observable.box(data.name);
    this.items = observable.array(data.items ?? tuple.filled(defaultHotbarCells, null));
  }

  isFull() {
    for (const item of this.items) {
      if (!item) {
        return false;
      }
    }

    return true;
  }

  hasEntity(entityId: string) {
    return this.items.findIndex(item => item?.entity.uid === entityId) >= 0;
  }

  private findClosestEmptyIndex(from: number, direction = 1) {
    let index = from;

    while (this.items[index] != null) {
      index += direction;
    }

    return index;
  }

  restack(from: number, to: number) {
    runInAction(() => {
      const source = this.items[from];
      const moveDown = from < to;

      if (
        from < 0 ||
        to < 0 ||
        from >= this.items.length ||
        to >= this.items.length ||
        isNaN(from) ||
        isNaN(to)
      ) {
        throw new Error("Invalid 'from' or 'to' arguments");
      }

      if (from == to) {
        return;
      }

      this.items.splice(from, 1, null);

      if (this.items[to] == null) {
        this.items.splice(to, 1, source);
      } else {
        // Move cells up or down to closes empty cell
        this.items.splice(this.findClosestEmptyIndex(to, moveDown ? -1 : 1), 1);
        this.items.splice(to, 0, source);
      }
    });
  }

  toggleEntity(item: CatalogEntity) {
    runInAction(() => {
      if (this.hasEntity(item.getId())) {
        this.removeEntity(item.getId());
      } else {
        this.addEntity(item);
      }
    });
  }

  removeEntity(uid: string) {
    runInAction(() => {
      const index = this.items.findIndex((item) => item?.entity.uid === uid);

      if (index < 0) {
        return;
      }

      this.items[index] = null;
    });
  }

  addEntity(item: CatalogEntity, cellIndex?: number) {
    const uid = item.getId();
    const name = item.getName();
    const shortName = getShortName(item);

    if (typeof uid !== "string") {
      throw new TypeError("CatalogEntity's ID must be a string");
    }

    if (typeof name !== "string") {
      throw new TypeError("CatalogEntity's NAME must be a string");
    }

    if (typeof shortName !== "string") {
      throw new TypeError("CatalogEntity's SHORT_NAME must be a string");
    }

    if (this.hasEntity(item.getId())) {
      return;
    }

    const entity = {
      uid,
      name,
      source: item.metadata.source,
      shortName,
    };
    const newItem = { entity };

    if (cellIndex === undefined) {
      // Add item to empty cell
      const emptyCellIndex = this.items.indexOf(null);

      if (emptyCellIndex >= 0) {
        runInAction(() => {
          this.items[emptyCellIndex] = newItem;
        });
      } else {
        broadcastMessage(hotbarTooManyItemsChannel);
      }
    } else if (0 <= cellIndex && cellIndex < this.items.length) {
      runInAction(() => {
        this.items[cellIndex] = newItem;
      });
    } else {
      this.dependencies.logger.error(
        "cannot pin entity to hotbar outside of index range",
        { entityId: uid, hotbarId: this.id, cellIndex },
      );
    }
  }

  toJSON(): HotbarData {
    return {
      id: this.id,
      items: toJS(this.items),
      name: this.name.get(),
    };
  }
}
