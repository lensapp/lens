/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ReplicaSets } from "./replicasets";
import replicasetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/replicasets-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const replicasetsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "replicasets-route-component",
  Component: ReplicaSets,
  routeInjectable: replicasetsRouteInjectable,
});

export default replicasetsRouteComponentInjectable;
