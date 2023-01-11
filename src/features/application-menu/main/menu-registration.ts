/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MenuItemConstructorOptions } from "electron";
import type { IComputedValue } from "mobx";

export type MenuRegistration = {
  parentId: string;
  visible?: IComputedValue<boolean> | boolean;
} & Omit<MenuItemConstructorOptions, "visible">;
