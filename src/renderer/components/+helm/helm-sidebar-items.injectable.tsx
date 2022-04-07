/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import React from "react";
import type {
  SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import {
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import { noop } from "lodash/fp";

export const helmSidebarItemId = "helm";

const helmSidebarItemsInjectable = getInjectable({
  id: "helm-sidebar-items",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: helmSidebarItemId,
        parentId: null,
        getIcon: () => <Icon svg="helm" />,
        title: "Helm",
        onClick: noop,
        orderNumber: 90,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});

export default helmSidebarItemsInjectable;
