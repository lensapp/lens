/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type {
  SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import {
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";
import { noop } from "lodash/fp";

export const userManagementSidebarItemId = "user-management";

const userManagementSidebarItemsInjectable = getInjectable({
  id: "user-management-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: userManagementSidebarItemId,
        parentId: null,
        getIcon: () => <Icon material="security" />,
        title: "Access Control",
        onClick: noop,
        orderNumber: 100,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default userManagementSidebarItemsInjectable;
