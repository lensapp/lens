/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Deployments } from "./deployments";
import deploymentsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/deployments-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const deploymentsRouteComponentInjectable = getInjectable({
  id: "deployments-route-component",

  instantiate: (di) => ({
    route: di.inject(deploymentsRouteInjectable),
    Component: Deployments,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default deploymentsRouteComponentInjectable;
