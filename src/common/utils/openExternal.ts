/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Opens a link in external browser
import { shell } from "electron";

export function openExternal(url: string) {
  return shell.openExternal(url);
}
