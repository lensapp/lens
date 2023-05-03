/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PortForwards } from "./port-forwards";
import portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const portForwardsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "port-forwards-route-component",
  Component: PortForwards,
  routeInjectable: portForwardsRouteInjectable,
});

export default portForwardsRouteComponentInjectable;
