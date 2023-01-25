/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuSeparatorInjectable,
} from "../../get-application-menu-separator-injectable";

export const separator1 = getApplicationMenuSeparatorInjectable({
  id: "separator-1-for-file",
  parentId: "file",
  orderNumber: 20,
  isShownOnlyOnMac: true,
});
