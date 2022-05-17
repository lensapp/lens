/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { noop } from "lodash/fp";
import { computed } from "mobx";
import type { SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";
import crdListRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/crd-list/crd-list-route.injectable";
import sidebarItemsForDefinitionGroupsInjectable from "./sidebar-items-for-definition-groups.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToCrdListInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/crd-list/navigate-to-crd-list.injectable";

const customResourceSidebarItemsInjectable = getInjectable({
  id: "custom-resource-sidebar-items",

  instantiate: (di) => {
    const navigateToCrdList = di.inject(navigateToCrdListInjectable);
    const crdListRoute = di.inject(crdListRouteInjectable);
    const crdListRouteIsActive = di.inject(routeIsActiveInjectable, crdListRoute);
    const definitionGroupSidebarItems = di.inject(sidebarItemsForDefinitionGroupsInjectable);

    return computed((): SidebarItemRegistration[] => {
      const definitionsItem = {
        id: "definitions",
        parentId: "custom-resources",
        title: "Definitions",
        onClick: navigateToCrdList,
        isActive: crdListRouteIsActive,
        isVisible: crdListRoute.isEnabled,
        orderNumber: 10,
      };

      const childrenAndGrandChildren = computed(() => [
        definitionsItem,
        ...definitionGroupSidebarItems.get(),
      ]);

      const parentItem: SidebarItemRegistration = {
        id: "custom-resources",
        parentId: null,
        title: "Custom Resources",
        getIcon: () => <Icon material="extension" />,
        onClick: noop,
        isVisible: computed(() => childrenAndGrandChildren.get().some(item => item.isVisible?.get())),
        orderNumber: 110,
      };

      return [parentItem, definitionsItem, ...definitionGroupSidebarItems.get()];
    });
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default customResourceSidebarItemsInjectable;
