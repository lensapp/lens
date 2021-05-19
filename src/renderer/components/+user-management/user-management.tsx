/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./user-management.scss";
import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { Roles } from "../+user-management-roles";
import { RoleBindings } from "../+user-management-roles-bindings";
import { ServiceAccounts } from "../+user-management-service-accounts";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { PodSecurityPolicies } from "../+pod-security-policies";
import * as routes from "../../../common/routes";
import type { Cluster } from "../../../main/cluster";

@observer
export class UserManagement extends React.Component<{ cluster: Cluster }> {
  static tabRoutes(cluster: Cluster): TabLayoutRoute[] {
    const query = namespaceUrlParam.toObjectParam();
    const tabRoutes: TabLayoutRoute[] = [];

    if (cluster.isAllowedResource("serviceaccounts")) {
      tabRoutes.push({
        title: "Service Accounts",
        component: ServiceAccounts,
        url: routes.serviceAccountsURL({ query }),
        routePath: routes.serviceAccountsRoute.path.toString(),
      });
    }

    if (cluster.isAnyAllowedResources("rolebindings", "clusterrolebindings")) {
      // TODO: seperate out these two pages
      tabRoutes.push({
        title: "Role Bindings",
        component: RoleBindings,
        url: routes.roleBindingsURL({ query }),
        routePath: routes.roleBindingsRoute.path.toString(),
      });
    }

    if (cluster.isAnyAllowedResources("roles", "clusterroles")) {
      // TODO: seperate out these two pages
      tabRoutes.push({
        title: "Roles",
        component: Roles,
        url: routes.rolesURL({ query }),
        routePath: routes.rolesRoute.path.toString(),
      });
    }

    if (cluster.isAllowedResource("podsecuritypolicies")) {
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
      <TabLayout className="UserManagement" tabs={UserManagement.tabRoutes(this.props.cluster)}/>
    );
  }
}
