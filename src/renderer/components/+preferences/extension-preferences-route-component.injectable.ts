/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import extensionPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import { Extensions } from "./extensions";

const extensionPreferencesRouteComponentInjectable = getInjectable({
  id: "extension-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(extensionPreferencesRouteInjectable),
    Component: Extensions,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default extensionPreferencesRouteComponentInjectable;
