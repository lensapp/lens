/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubeResource } from "../../../common/rbac";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { PodSecurityPolicies } from "../+pod-security-policies";
import * as routes from "../../../common/routes";
import { ClusterRoleBindings } from "../+cluster-role-bindings";
import { ServiceAccounts } from "../+service-accounts";
import { Roles } from "../+roles";
import { RoleBindings } from "../+role-bindings";
import { ClusterRoles } from "../+cluster-roles";
import { computed, IComputedValue } from "mobx";

interface Dependencies {
  isAllowedResource: (resource: KubeResource) => boolean;
}

function getUserManagementRoutes({ isAllowedResource }: Dependencies): IComputedValue<TabLayoutRoute[]> {
  return computed(() => {
    const tabRoutes: TabLayoutRoute[] = [];

    if (isAllowedResource("serviceaccounts")) {
      tabRoutes.push({
        title: "Service Accounts",
        component: ServiceAccounts,
        url: routes.serviceAccountsURL(),
        routePath: routes.serviceAccountsRoute.path.toString(),
      });
    }

    if (isAllowedResource("clusterroles")) {
      tabRoutes.push({
        title: "Cluster Roles",
        component: ClusterRoles,
        url: routes.clusterRolesURL(),
        routePath: routes.clusterRolesRoute.path.toString(),
      });
    }

    if (isAllowedResource("roles")) {
      tabRoutes.push({
        title: "Roles",
        component: Roles,
        url: routes.rolesURL(),
        routePath: routes.rolesRoute.path.toString(),
      });
    }

    if (isAllowedResource("clusterrolebindings")) {
      tabRoutes.push({
        title: "Cluster Role Bindings",
        component: ClusterRoleBindings,
        url: routes.clusterRoleBindingsURL(),
        routePath: routes.clusterRoleBindingsRoute.path.toString(),
      });
    }

    if (isAllowedResource("rolebindings")) {
      tabRoutes.push({
        title: "Role Bindings",
        component: RoleBindings,
        url: routes.roleBindingsURL(),
        routePath: routes.roleBindingsRoute.path.toString(),
      });
    }

    if (isAllowedResource("podsecuritypolicies")) {
      tabRoutes.push({
        title: "Pod Security Policies",
        component: PodSecurityPolicies,
        url: routes.podSecurityPoliciesURL(),
        routePath: routes.podSecurityPoliciesRoute.path.toString(),
      });
    }

    return tabRoutes;
  });
}

const userManagementRoutesInjectable = getInjectable({
  instantiate: (di) => getUserManagementRoutes({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default userManagementRoutesInjectable;
