/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import proxyPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/proxy/proxy-preferences-route.injectable";
import { LensProxy } from "./proxy";

const proxyPreferencesRouteComponentInjectable = getInjectable({
  id: "proxy-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(proxyPreferencesRouteInjectable),
    Component: LensProxy,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default proxyPreferencesRouteComponentInjectable;
