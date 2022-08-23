/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import terminalPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/terminal/terminal-preferences-route.injectable";
import { Terminal } from "./terminal";

const terminalPreferencesRouteComponentInjectable = getInjectable({
  id: "terminal-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(terminalPreferencesRouteInjectable),
    Component: Terminal,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default terminalPreferencesRouteComponentInjectable;
