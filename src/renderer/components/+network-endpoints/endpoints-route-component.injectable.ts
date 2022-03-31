/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Endpoints } from "./endpoints";
import endpointsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/endpoints-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const endpointsRouteComponentInjectable = getInjectable({
  id: "endpoints-route-component",

  instantiate: (di) => ({
    route: di.inject(endpointsRouteInjectable),
    Component: Endpoints,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default endpointsRouteComponentInjectable;
