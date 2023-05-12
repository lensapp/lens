/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { StrictReactNode } from "@k8slens/utilities";

export interface SidebarItemRegistration {
  id?: undefined;
  parentId: string | null;
  title: StrictReactNode;
  onClick: () => void;
  getIcon?: () => StrictReactNode;
  isActive?: IComputedValue<boolean>;
  isVisible?: IComputedValue<boolean>;
  orderNumber: number;
}

export interface SidebarItemDeclaration {
  id: string;
  parentId: string | null;
  title: StrictReactNode;
  onClick: () => void;
  getIcon?: () => StrictReactNode;
  isActive: IComputedValue<boolean>;
  isVisible: IComputedValue<boolean>;
  children: SidebarItemDeclaration[];
}

export const sidebarItemInjectionToken = getInjectionToken<SidebarItemRegistration>({
  id: "sidebar-item-injection-token",
});
