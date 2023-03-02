/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ReadonlyDeep } from "type-fest";

export function readonly<T>(src: T): ReadonlyDeep<T> {
  return src as ReadonlyDeep<T>;
}
