/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuSeparatorInjectable,
} from "../../get-application-menu-separator-injectable";

export const separator1 = getApplicationMenuSeparatorInjectable({
  id: "separator-1",
  parentId: "mac",
  orderNumber: 30,
});

export const separator2 = getApplicationMenuSeparatorInjectable({
  id: "separator-2",
  parentId: "mac",
  orderNumber: 70,
});

export const separator3 = getApplicationMenuSeparatorInjectable({
  id: "separator-3",
  parentId: "mac",
  orderNumber: 90,
});

export const separator4 = getApplicationMenuSeparatorInjectable({
  id: "separator-4",
  parentId: "mac",
  orderNumber: 130,
});
