import "./user-management.scss"

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { Roles } from "../+user-management-roles";
import { RoleBindings } from "../+user-management-roles-bindings";
import { ServiceAccounts } from "../+user-management-service-accounts";
import { roleBindingsRoute, roleBindingsURL, rolesRoute, rolesURL, serviceAccountsRoute, serviceAccountsURL, usersManagementURL } from "./user-management.routes";
import { namespaceStore } from "../+namespaces/namespace.store";
import { configStore } from "../../config.store";
import { PodSecurityPolicies, podSecurityPoliciesRoute, podSecurityPoliciesURL } from "../+pod-security-policies";

interface Props extends RouteComponentProps<{}> {
}

@observer
export class UserManagement extends React.Component<Props> {
  static get tabRoutes() {
    const tabRoutes: TabRoute[] = [];
    const { allowedResources } = configStore;
    const query = namespaceStore.getContextParams()
    tabRoutes.push(
      {
        title: <Trans>Service Accounts</Trans>,
        component: ServiceAccounts,
        url: serviceAccountsURL({ query }),
        path: serviceAccountsRoute.path,
      },
      {
        title: <Trans>Role Bindings</Trans>,
        component: RoleBindings,
        url: roleBindingsURL({ query }),
        path: roleBindingsRoute.path,
      },
      {
        title: <Trans>Roles</Trans>,
        component: Roles,
        url: rolesURL({ query }),
        path: rolesRoute.path,
      },
    )
    if (allowedResources.includes("podsecuritypolicies")) {
      tabRoutes.push({
        title: <Trans>Pod Security Policies</Trans>,
        component: PodSecurityPolicies,
        url: podSecurityPoliciesURL(),
        path: podSecurityPoliciesRoute.path,
      })
    }
    return tabRoutes;
  }

  render() {
    const tabRoutes = UserManagement.tabRoutes;
    return (
      <MainLayout className="UserManagement" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={usersManagementURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </MainLayout>
    )
  }
}
