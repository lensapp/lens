/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  getApplicationMenuOperationSystemActionInjectable,
} from "../../get-application-menu-operation-system-action-injectable";

export const actionForToggleDevTools = getApplicationMenuOperationSystemActionInjectable({
  id: "toggle-dev-tools",
  parentId: "view",
  orderNumber: 70,
  actionName: "toggleDevTools",
});

export const actionForResetZoom = getApplicationMenuOperationSystemActionInjectable({
  id: "reset-zoom",
  parentId: "view",
  orderNumber: 90,
  actionName: "resetZoom",
});

export const actionForZoomIn = getApplicationMenuOperationSystemActionInjectable({
  id: "zoom-in",
  parentId: "view",
  orderNumber: 100,
  actionName: "zoomIn",
});

export const actionForZoomOut = getApplicationMenuOperationSystemActionInjectable({
  id: "zoom-out",
  parentId: "view",
  orderNumber: 110,
  actionName: "zoomOut",
});

export const actionForToggleFullScreen = getApplicationMenuOperationSystemActionInjectable({
  id: "toggle-full-screen",
  parentId: "view",
  orderNumber: 130,
  actionName: "togglefullscreen",
});
