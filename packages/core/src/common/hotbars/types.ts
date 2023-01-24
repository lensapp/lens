/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as uuid from "uuid";
import type { Tuple } from "../utils";
import { tuple } from "../utils";

export interface HotbarItemEntity {
  uid: string;
  name: string;
  shortName: string;
  source?: string;
}

export interface HotbarItem {
  entity: HotbarItemEntity;
  params?: Partial<Record<string, string>>;
}

export type Hotbar = Required<CreateHotbarData>;

export interface CreateHotbarData {
  id?: string;
  name: string;
  items?: Tuple<HotbarItem | null, typeof defaultHotbarCells>;
}

export interface CreateHotbarOptions {
  setActive?: boolean;
}

export const defaultHotbarCells = 12; // Number is chosen to easy hit any item with keyboard

export function getEmptyHotbar(name: string, id: string = uuid.v4()): Hotbar {
  return {
    id,
    items: tuple.filled(defaultHotbarCells, null),
    name,
  };
}
