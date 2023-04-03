/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export interface HotbarItem {
  entity: {
    uid: string;
    name: string;
    source?: string;
  };
  params?: {
    [key: string]: string;
  };
}

export interface CreateHotbarData {
  id?: string;
  name: string;
  items?: (HotbarItem | null)[];
}

export interface CreateHotbarOptions {
  setActive?: boolean;
}

export const defaultHotbarCells = 12; // Number is chosen to easy hit any item with keyboard
