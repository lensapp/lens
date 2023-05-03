/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Pods } from "./pods";
import podsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/pods/pods-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const podsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "pods-route-component",
  Component: Pods,
  routeInjectable: podsRouteInjectable,
});

export default podsRouteComponentInjectable;
