/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import telemetryPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/telemetry/telemetry-preferences-route.injectable";
import { Telemetry } from "./telemetry";

const telemetryPreferencesRouteComponentInjectable = getInjectable({
  id: "telemetry-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(telemetryPreferencesRouteInjectable),
    Component: Telemetry,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default telemetryPreferencesRouteComponentInjectable;
