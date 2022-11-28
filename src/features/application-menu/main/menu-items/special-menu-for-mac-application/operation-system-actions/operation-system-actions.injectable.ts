/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuOperationSystemActionInjectable,
} from "../../get-application-menu-operation-system-action-injectable";

export const actionForServices = getApplicationMenuOperationSystemActionInjectable({
  id: "services",
  parentId: "mac",
  orderNumber: 80,
  actionName: "services",
});

export const actionForHide = getApplicationMenuOperationSystemActionInjectable({
  id: "hide",
  parentId: "mac",
  orderNumber: 100,
  actionName: "hide",
});

export const actionForHideOthers = getApplicationMenuOperationSystemActionInjectable({
  id: "hide-others",
  parentId: "mac",
  orderNumber: 110,
  actionName: "hideOthers",
});

export const actionForUnhide = getApplicationMenuOperationSystemActionInjectable({
  id: "unhide",
  parentId: "mac",
  orderNumber: 120,
  actionName: "unhide",
});
