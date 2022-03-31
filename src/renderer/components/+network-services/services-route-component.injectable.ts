/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Services } from "./services";
import servicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/services/services-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const servicesRouteComponentInjectable = getInjectable({
  id: "services-route-component",

  instantiate: (di) => ({
    route: di.inject(servicesRouteInjectable),
    Component: Services,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default servicesRouteComponentInjectable;
