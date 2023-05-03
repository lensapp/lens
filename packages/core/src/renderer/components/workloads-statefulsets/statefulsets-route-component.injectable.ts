/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { StatefulSets } from "./statefulsets";
import statefulsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/statefulsets-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const statefulsetsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "statefulsets-route-component",
  Component: StatefulSets,
  routeInjectable: statefulsetsRouteInjectable,
});

export default statefulsetsRouteComponentInjectable;
