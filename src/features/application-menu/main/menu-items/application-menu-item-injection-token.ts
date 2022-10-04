/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

interface Shared {
  parentId: string | null;
  orderNumber: number;
  isShown?: boolean;
}

export interface ApplicationMenuItem extends Shared {
  id: string;
  label: string;
  click?: () => void;
  accelerator?: string;
}

export interface Separator extends Shared {
  type: "separator";
}

export interface OperationSystemAction extends Shared {
  role: "services" | "hide" | "hideOthers" | "unhide";
}

export type ApplicationMenuItemTypes = ApplicationMenuItem | Separator | OperationSystemAction;

const applicationMenuItemInjectionToken = getInjectionToken<ApplicationMenuItemTypes>({
  id: "application-menu-item-injection-token",
});

export default applicationMenuItemInjectionToken;
