/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { noop } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { Icon } from "@k8slens/icon";

const customResourcesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-custom-resources",
  instantiate: () => ({
    parentId: null,
    title: "Custom Resources",
    getIcon: () => <Icon material="extension" />,
    onClick: noop,
    orderNumber: 110,
  }),
  injectionToken: sidebarItemInjectionToken,
});

export default customResourcesSidebarItemInjectable;
