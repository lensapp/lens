/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuOperationSystemActionInjectable,
} from "../../get-application-menu-operation-system-action-injectable";

export const actionForServices = getApplicationMenuOperationSystemActionInjectable({
  id: "services",
  parentId: "primary-for-mac",
  orderNumber: 80,
  role: "services",
});

export const actionForHide = getApplicationMenuOperationSystemActionInjectable({
  id: "hide",
  parentId: "primary-for-mac",
  orderNumber: 100,
  role: "hide",
});

export const actionForHideOthers = getApplicationMenuOperationSystemActionInjectable({
  id: "hide-others",
  parentId: "primary-for-mac",
  orderNumber: 110,
  role: "hideOthers",
});

export const actionForUnhide = getApplicationMenuOperationSystemActionInjectable({
  id: "unhide",
  parentId: "primary-for-mac",
  orderNumber: 120,
  role: "unhide",
});
