/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import podSecurityPoliciesRouteInjectable from "../../../common/front-end-routing/routes/cluster/user-management/pod-security-policies/pod-security-policies-route.injectable";
import { userManagementSidebarItemId } from "../+user-management/user-management-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPodSecurityPoliciesInjectable from "../../../common/front-end-routing/routes/cluster/user-management/pod-security-policies/navigate-to-pod-security-policies.injectable";

const podSecurityPoliciesSidebarItemsInjectable = getInjectable({
  id: "pod-security-policies-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(podSecurityPoliciesRouteInjectable);
    const navigateToPodSecurityPolicies = di.inject(navigateToPodSecurityPoliciesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "pod-security-policies",
        parentId: userManagementSidebarItemId,
        title: "Pod Security Policies",
        onClick: navigateToPodSecurityPolicies,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 60,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default podSecurityPoliciesSidebarItemsInjectable;
