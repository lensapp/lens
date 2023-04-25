/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ReplicaSets } from "./replicasets";
import replicasetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/replicasets-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const replicasetsRouteComponentInjectable = getInjectable({
  id: "replicasets-route-component",

  instantiate: (di) => ({
    route: di.inject(replicasetsRouteInjectable),
    Component: ReplicaSets,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default replicasetsRouteComponentInjectable;
