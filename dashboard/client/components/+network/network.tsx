import "./network.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { Trans } from "@lingui/macro";
import { MainLayout, TabRoute } from "../layout/main-layout";
import { Services, servicesRoute, servicesURL } from "../+network-services";
import { Endpoints, endpointRoute, endpointURL } from "../+network-endpoints";
import { Ingresses, ingressRoute, ingressURL } from "../+network-ingresses";
import { NetworkPolicies, networkPoliciesRoute, networkPoliciesURL } from "../+network-policies";
import { namespaceStore } from "../+namespaces/namespace.store";
import { networkURL } from "./network.route";

interface Props extends RouteComponentProps<{}> {
}

@observer
export class Network extends React.Component<Props> {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams()
    return [
      {
        title: <Trans>Services</Trans>,
        component: Services,
        url: servicesURL({ query }),
        path: servicesRoute.path,
      },
      {
        title: <Trans>Endpoints</Trans>,
        component: Endpoints,
        url: endpointURL({ query }),
        path: endpointRoute.path,
      },
      {
        title: <Trans>Ingresses</Trans>,
        component: Ingresses,
        url: ingressURL({ query }),
        path: ingressRoute.path,
      },
      {
        title: <Trans>Network Policies</Trans>,
        component: NetworkPolicies,
        url: networkPoliciesURL({ query }),
        path: networkPoliciesRoute.path,
      },
    ]
  }

  render() {
    const tabRoutes = Network.tabRoutes;
    return (
      <MainLayout className="Network" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route}/>)}
          <Redirect to={networkURL({ query: namespaceStore.getContextParams() })}/>
        </Switch>
      </MainLayout>
    )
  }
}