/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./user-management.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { PodSecurityPolicies } from "../+pod-security-policies";
import { isAllowedResource } from "../../../common/utils/allowed-resource";
import * as routes from "../../../common/routes";
import { ClusterRoleBindings } from "./+cluster-role-bindings";
import { ServiceAccounts } from "./+service-accounts";
import { Roles } from "./+roles";
import { RoleBindings } from "./+role-bindings";
import { ClusterRoles } from "./+cluster-roles";

@observer
export class UserManagement extends React.Component {
  static get tabRoutes() {
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
  }

  render() {
    return (
      <TabLayout className="UserManagement" tabs={UserManagement.tabRoutes}/>
    );
  }
}
