/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Welcome } from "./welcome";
import welcomeRouteInjectable from "../common/welcome-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../../renderer/routes/route-specific-component-injection-token";

const welcomeRouteComponentInjectable = getInjectable({
  id: "welcome-route-component",

  instantiate: (di) => ({
    route: di.inject(welcomeRouteInjectable),
    Component: Welcome,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default welcomeRouteComponentInjectable;
