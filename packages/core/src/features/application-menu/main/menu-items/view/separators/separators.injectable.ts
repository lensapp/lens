/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuSeparatorInjectable,
} from "../../get-application-menu-separator-injectable";

export const separator1 = getApplicationMenuSeparatorInjectable({
  id: "separator-1-for-view",
  parentId: "view",
  orderNumber: 30,
});

export const separator2 = getApplicationMenuSeparatorInjectable({
  id: "separator-2-for-view",
  parentId: "view",
  orderNumber: 80,
});

export const separator3 = getApplicationMenuSeparatorInjectable({
  id: "separator-3-for-view",
  parentId: "view",
  orderNumber: 120,
});
