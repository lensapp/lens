/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { Icon } from "@k8slens/icon";
import React from "react";
import { noop } from "lodash/fp";

const storageSidebarItemInjectable = getInjectable({
  id: "sidebar-item-storage",

  instantiate: () => ({
    parentId: null,
    getIcon: () => <Icon material="storage" />,
    title: "Storage",
    onClick: noop,
    orderNumber: 60,
  }),

  injectionToken: sidebarItemInjectionToken,
});

export default storageSidebarItemInjectable;
