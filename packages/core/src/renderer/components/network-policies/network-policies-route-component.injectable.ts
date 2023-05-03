/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { NetworkPolicies } from "./network-policies";
import networkPoliciesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/network-policies/network-policies-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const networkPoliciesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "network-policies-route-component",
  Component: NetworkPolicies,
  routeInjectable: networkPoliciesRouteInjectable,
});

export default networkPoliciesRouteComponentInjectable;
