/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import appPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/app/app-preferences-route.injectable";
import { Application } from "./application";

const appPreferencesRouteComponentInjectable = getInjectable({
  id: "app-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(appPreferencesRouteInjectable),
    Component: Application,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default appPreferencesRouteComponentInjectable;
