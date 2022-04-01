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

export const networkSidebarItemId = "network";

const networkSidebarItemsInjectable = getInjectable({
  id: "network-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: networkSidebarItemId,
        parentId: null,
        getIcon: () => <Icon material="device_hub" />,
        title: "Network",
        onClick: noop,
        orderNumber: 50,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default networkSidebarItemsInjectable;
