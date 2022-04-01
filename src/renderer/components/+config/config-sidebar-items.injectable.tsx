/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Icon } from "../icon";
import React from "react";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { computed } from "mobx";
import { noop } from "lodash/fp";

export const configSidebarItemId = "config";

const configSidebarItemsInjectable = getInjectable({
  id: "config-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: configSidebarItemId,
        parentId: null,
        title: "Config",
        getIcon: () => <Icon material="list" />,
        onClick: noop,
        orderNumber: 40,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default configSidebarItemsInjectable;
