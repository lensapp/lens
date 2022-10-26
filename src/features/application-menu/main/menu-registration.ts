/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MenuItemConstructorOptions } from "electron";

export interface MenuRegistration extends MenuItemConstructorOptions {
  parentId: string;
}
