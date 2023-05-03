/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PodSecurityPolicies } from "./pod-security-policies";
import podSecurityPoliciesRouteInjectable from "../../../common/front-end-routing/routes/cluster/user-management/pod-security-policies/pod-security-policies-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const podSecurityPoliciesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "pod-security-policies-route-component",
  Component: PodSecurityPolicies,
  routeInjectable: podSecurityPoliciesRouteInjectable,
});

export default podSecurityPoliciesRouteComponentInjectable;
