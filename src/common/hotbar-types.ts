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

import * as uuid from "uuid";
import type { Tuple } from "./utils";

export interface HotbarItem {
  entity: {
    uid: string;
    name?: string;
    source?: string;
  };
  params?: {
    [key: string]: string;
  }
}

export type Hotbar = Required<HotbarCreateOptions>;

export interface HotbarCreateOptions {
  id?: string;
  name: string;
  items?: Tuple<HotbarItem | null, typeof defaultHotbarCells>;
}

export const defaultHotbarCells = 12; // Number is chosen to easy hit any item with keyboard

export function getEmptyHotbar(name: string, id: string = uuid.v4()): Hotbar {
  return {
    id,
    items: Array(defaultHotbarCells).fill(null) as Tuple<HotbarItem | null, typeof defaultHotbarCells>,
    name,
  };
}
