/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import ingressClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/ingress-class/ingress-classes-route.injectable";
import { IngressClasses } from "./ingress-classes";

const ingressClassesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "ingress-classes-route-component",
  Component: IngressClasses,
  routeInjectable: ingressClassesRouteInjectable,
});

export default ingressClassesRouteComponentInjectable;
