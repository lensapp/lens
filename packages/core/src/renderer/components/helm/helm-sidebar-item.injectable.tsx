/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { Icon } from "@k8slens/icon";
import { noop } from "lodash/fp";

const helmSidebarItemInjectable = getInjectable({
  id: "sidebar-item-helm",

  instantiate: () => ({
    parentId: null,
    getIcon: () => <Icon svg="helm" />,
    title: "Helm",
    onClick: noop,
    orderNumber: 90,
  }),

  injectionToken: sidebarItemInjectionToken,
});

export default helmSidebarItemInjectable;
