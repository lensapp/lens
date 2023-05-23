/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import {
  routeSpecificComponentInjectionToken,
} from "../../routes/route-specific-component-injection-token";
import ingressClassesesRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/network/ingress-class/ingress-classeses-route.injectable";
import { IngressClasses } from "./ingress-classes";

const ingressClassesRouteComponentInjectable = getInjectable({
  id: "ingress-classes-route-component",

  instantiate: (di) => ({
    route: di.inject(ingressClassesesRouteInjectable),
    Component: IngressClasses,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default ingressClassesRouteComponentInjectable;
