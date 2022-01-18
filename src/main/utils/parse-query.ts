/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export function getBoolean(query: URLSearchParams, key: string): boolean {
  const value = query.get(key);

  switch (value?.toLowerCase()) {
    case "false":
    case "f":
    case "0":
    case null:
    case undefined:
      return false;
    default:
      return true;
  }
}
