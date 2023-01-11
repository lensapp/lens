/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { StatefulSets } from "./statefulsets";
import statefulsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/statefulsets-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const statefulsetsRouteComponentInjectable = getInjectable({
  id: "statefulsets-route-component",

  instantiate: (di) => ({
    route: di.inject(statefulsetsRouteInjectable),
    Component: StatefulSets,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default statefulsetsRouteComponentInjectable;
