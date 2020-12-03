import "./user-management.scss";
import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { Roles } from "../+user-management-roles";
import { RoleBindings } from "../+user-management-roles-bindings";
import { ServiceAccounts } from "../+user-management-service-accounts";
import { roleBindingsRoute, roleBindingsURL, rolesRoute, rolesURL, serviceAccountsRoute, serviceAccountsURL } from "./user-management.route";
import { namespaceStore } from "../+namespaces/namespace.store";
import { PodSecurityPolicies, podSecurityPoliciesRoute, podSecurityPoliciesURL } from "../+pod-security-policies";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class UserManagement extends React.Component {
  static get tabRoutes() {
    const tabRoutes: TabLayoutRoute[] = [];
    const query = namespaceStore.getContextParams();

    tabRoutes.push(
      {
        title: <Trans>Service Accounts</Trans>,
        component: ServiceAccounts,
        url: serviceAccountsURL({ query }),
        routePath: serviceAccountsRoute.path.toString(),
      },
      {
        title: <Trans>Role Bindings</Trans>,
        component: RoleBindings,
        url: roleBindingsURL({ query }),
        routePath: roleBindingsRoute.path.toString(),
      },
      {
        title: <Trans>Roles</Trans>,
        component: Roles,
        url: rolesURL({ query }),
        routePath: rolesRoute.path.toString(),
      },
    );

    if (isAllowedResource("podsecuritypolicies")) {
      tabRoutes.push({
        title: <Trans>Pod Security Policies</Trans>,
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
