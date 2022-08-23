/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { PortForwards } from "./port-forwards";
import portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const portForwardsRouteComponentInjectable = getInjectable({
  id: "port-forwards-route-component",

  instantiate: (di) => ({
    route: di.inject(portForwardsRouteInjectable),
    Component: PortForwards,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default portForwardsRouteComponentInjectable;
