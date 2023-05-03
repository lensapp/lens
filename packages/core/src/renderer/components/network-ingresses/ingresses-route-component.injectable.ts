/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Ingresses } from "./ingresses";
import ingressesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/ingresses/ingresses-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const ingressesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "ingresses-route-component",
  Component: Ingresses,
  routeInjectable: ingressesRouteInjectable,
});

export default ingressesRouteComponentInjectable;
