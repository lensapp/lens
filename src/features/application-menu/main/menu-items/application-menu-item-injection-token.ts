/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { BrowserWindow, MenuItem, KeyboardEvent } from "electron";

interface Shared {
  parentId: string | null;
  orderNumber: number;
  isShown?: boolean;
}

export interface ApplicationMenuItem extends Shared {
  label: string;
  accelerator?: string;
  id: string;

  // TODO: This leaky abstraction is exposed in Extension API, therefore cannot be updated
  click?: (
    menuItem: MenuItem,
    browserWindow: BrowserWindow | undefined,
    event: KeyboardEvent
  ) => void;
}

export interface Separator extends Shared {
  type: "separator";
}

export interface OperationSystemAction extends Shared {
  label?: string;
  accelerator?: string;

  role:
    | "services"
    | "hide"
    | "hideOthers"
    | "unhide"
    | "close"
    | "undo"
    | "redo"
    | "cut"
    | "copy"
    | "paste"
    | "delete"
    | "selectAll"
    | "toggleDevTools"
    | "resetZoom"
    | "zoomIn"
    | "zoomOut"
    | "togglefullscreen";
}

export type ApplicationMenuItemTypes =
  | ApplicationMenuItem
  | Separator
  | OperationSystemAction;

const applicationMenuItemInjectionToken =
  getInjectionToken<ApplicationMenuItemTypes>({
    id: "application-menu-item-injection-token",
  });

export default applicationMenuItemInjectionToken;
