/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { DaemonSets } from "./daemonsets";
import daemonsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/daemonsets/daemonsets-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const daemonsetsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "daemonsets-route-component",
  Component: DaemonSets,
  routeInjectable: daemonsetsRouteInjectable,
});

export default daemonsetsRouteComponentInjectable;
