/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";
import * as routes from "../../../common/routes";
import { PodSecurityPolicies } from "../+pod-security-policies";
import { ClusterRoleBindings } from "./+cluster-role-bindings";
import { ClusterRoles } from "./+cluster-roles";
import { RoleBindings } from "./+role-bindings";
import { Roles } from "./+roles";
import { ServiceAccounts } from "./+service-accounts";

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

function getRouteTabs({ isAllowedResource }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (isAllowedResource("serviceaccounts")) {
      tabs.push({
        title: "Service Accounts",
        component: ServiceAccounts,
        url: routes.serviceAccountsURL(),
        routePath: routes.serviceAccountsRoute.path.toString(),
      });
    }

    if (isAllowedResource("clusterroles")) {
      tabs.push({
        title: "Cluster Roles",
        component: ClusterRoles,
        url: routes.clusterRolesURL(),
        routePath: routes.clusterRolesRoute.path.toString(),
      });
    }

    if (isAllowedResource("roles")) {
      tabs.push({
        title: "Roles",
        component: Roles,
        url: routes.rolesURL(),
        routePath: routes.rolesRoute.path.toString(),
      });
    }

    if (isAllowedResource("clusterrolebindings")) {
      tabs.push({
        title: "Cluster Role Bindings",
        component: ClusterRoleBindings,
        url: routes.clusterRoleBindingsURL(),
        routePath: routes.clusterRoleBindingsRoute.path.toString(),
      });
    }

    if (isAllowedResource("rolebindings")) {
      tabs.push({
        title: "Role Bindings",
        component: RoleBindings,
        url: routes.roleBindingsURL(),
        routePath: routes.roleBindingsRoute.path.toString(),
      });
    }

    if (isAllowedResource("podsecuritypolicies")) {
      tabs.push({
        title: "Pod Security Policies",
        component: PodSecurityPolicies,
        url: routes.podSecurityPoliciesURL(),
        routePath: routes.podSecurityPoliciesRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const userManagementRouteTabsInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default userManagementRouteTabsInjectable;
