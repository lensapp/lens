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

import "./network.scss";

import React from "react";
import { observer } from "mobx-react";
import { TabLayout, TabLayoutRoute } from "../layout/tab-layout";
import { Services, servicesRoute, servicesURL } from "../+network-services";
import { endpointRoute, Endpoints, endpointURL } from "../+network-endpoints";
import { Ingresses, ingressRoute, ingressURL } from "../+network-ingresses";
import { NetworkPolicies, networkPoliciesRoute, networkPoliciesURL } from "../+network-policies";
import { isAllowedResource } from "../../../common/rbac";

@observer
export class Network extends React.Component {
  static get tabRoutes(): TabLayoutRoute[] {
    const routes: TabLayoutRoute[] = [];

    if (isAllowedResource("services")) {
      routes.push({
        title: "Services",
        component: Services,
        url: servicesURL(),
        routePath: servicesRoute.path.toString(),
      });
    }

    if (isAllowedResource("endpoints")) {
      routes.push({
        title: "Endpoints",
        component: Endpoints,
        url: endpointURL(),
        routePath: endpointRoute.path.toString(),
      });
    }

    if (isAllowedResource("ingresses")) {
      routes.push({
        title: "Ingresses",
        component: Ingresses,
        url: ingressURL(),
        routePath: ingressRoute.path.toString(),
      });
    }

    if (isAllowedResource("networkpolicies")) {
      routes.push({
        title: "Network Policies",
        component: NetworkPolicies,
        url: networkPoliciesURL(),
        routePath: networkPoliciesRoute.path.toString(),
      });
    }

    return routes;
  }

  render() {
    return (
      <TabLayout className="Network" tabs={Network.tabRoutes}/>
    );
  }
}
