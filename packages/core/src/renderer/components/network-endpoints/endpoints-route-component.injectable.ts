/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Endpoints } from "./endpoints";
import endpointsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/endpoints-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const endpointsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "endpoints-route-component",
  Component: Endpoints,
  routeInjectable: endpointsRouteInjectable,
});

export default endpointsRouteComponentInjectable;
