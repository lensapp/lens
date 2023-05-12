/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { Icon } from "@k8slens/icon";
import React from "react";
import { noop } from "lodash/fp";

const workloadsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-workloads",

  instantiate: () => ({
    parentId: null,
    title: "Workloads",
    getIcon: () => <Icon svg="workloads" />,
    onClick: noop,
    orderNumber: 20,
  }),

  injectionToken: sidebarItemInjectionToken,
});

export default workloadsSidebarItemInjectable;
