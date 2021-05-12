import "./user-management.scss";
import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { Roles } from "../+user-management-roles";
import { RoleBindings } from "../+user-management-roles-bindings";
import { ServiceAccounts } from "../+user-management-service-accounts";
import { podSecurityPoliciesRoute, podSecurityPoliciesURL, roleBindingsRoute, roleBindingsURL, rolesRoute, rolesURL, serviceAccountsRoute, serviceAccountsURL } from "./user-management.route";
import { PodSecurityPolicies } from "../+pod-security-policies";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class UserManagement extends React.Component {
  static get tabRoutes() {
    const tabRoutes: TabLayoutRoute[] = [];

    if (isAllowedResource("serviceaccounts")) {
      tabRoutes.push({
        title: "Service Accounts",
        component: ServiceAccounts,
        url: serviceAccountsURL(),
        routePath: serviceAccountsRoute.path.toString(),
      });
    }

    if (isAllowedResource("rolebindings") || isAllowedResource("clusterrolebindings")) {
      // TODO: seperate out these two pages
      tabRoutes.push({
        title: "Role Bindings",
        component: RoleBindings,
        url: roleBindingsURL(),
        routePath: roleBindingsRoute.path.toString(),
      });
    }

    if (isAllowedResource("roles") || isAllowedResource("clusterroles")) {
      // TODO: seperate out these two pages
      tabRoutes.push({
        title: "Roles",
        component: Roles,
        url: rolesURL(),
        routePath: rolesRoute.path.toString(),
      });
    }

    if (isAllowedResource("podsecuritypolicies")) {
      tabRoutes.push({
        title: "Pod Security Policies",
        component: PodSecurityPolicies,
        url: podSecurityPoliciesURL(),
        routePath: podSecurityPoliciesRoute.path.toString(),
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
