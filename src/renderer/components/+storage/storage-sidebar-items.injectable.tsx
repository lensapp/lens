/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";
import { noop } from "lodash/fp";

export const storageSidebarItemId = "storage";

const storageSidebarItemsInjectable = getInjectable({
  id: "storage-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: storageSidebarItemId,
        parentId: null,
        getIcon: () => <Icon material="storage" />,
        title: "Storage",
        onClick: noop,
        orderNumber: 60,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default storageSidebarItemsInjectable;
