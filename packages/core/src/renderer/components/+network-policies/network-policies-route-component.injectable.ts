/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NetworkPolicies } from "./network-policies";
import networkPoliciesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/network-policies/network-policies-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const networkPoliciesRouteComponentInjectable = getInjectable({
  id: "network-policies-route-component",

  instantiate: (di) => ({
    route: di.inject(networkPoliciesRouteInjectable),
    Component: NetworkPolicies,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default networkPoliciesRouteComponentInjectable;
