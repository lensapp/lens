/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Clone json-serializable object

export function cloneJsonObject<T = object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
