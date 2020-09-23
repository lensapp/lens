import "./network.scss"

import React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { TabLayout, TabRoute } from "../layout/tab-layout";
import { Services, servicesRoute, servicesURL } from "../+network-services";
import { Endpoints, endpointRoute, endpointURL } from "../+network-endpoints";
import { Ingresses, ingressRoute, ingressURL } from "../+network-ingresses";
import { NetworkPolicies, networkPoliciesRoute, networkPoliciesURL } from "../+network-policies";
import { namespaceStore } from "../+namespaces/namespace.store";
import { networkURL } from "./network.route";
import { isAllowedResource } from "../../../common/rbac";

interface Props extends RouteComponentProps<{}> {
}

@observer
export class Network extends React.Component<Props> {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams()
    const routes: TabRoute[] = [];
    if (isAllowedResource("services")) {
      routes.push({
        title: <Trans>Services</Trans>,
        component: Services,
        url: servicesURL({ query }),
        path: servicesRoute.path,
      })
    }
    if (isAllowedResource("endpoints")) {
      routes.push({
        title: <Trans>Endpoints</Trans>,
        component: Endpoints,
        url: endpointURL({ query }),
        path: endpointRoute.path,
      })
    }
    if (isAllowedResource("ingresses")) {
      routes.push({
        title: <Trans>Ingresses</Trans>,
        component: Ingresses,
        url: ingressURL({ query }),
        path: ingressRoute.path,
      })
    }
    if (isAllowedResource("networkpolicies")) {
      routes.push({
        title: <Trans>Network Policies</Trans>,
        component: NetworkPolicies,
        url: networkPoliciesURL({ query }),
        path: networkPoliciesRoute.path,
      })
    }
    return routes
  }

  render() {
    const tabRoutes = Network.tabRoutes;
    return (
      <TabLayout className="Network" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={networkURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </TabLayout>
    )
  }
}
