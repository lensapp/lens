/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Extensions } from "./extensions";
import extensionsRouteInjectable from "../../../common/front-end-routing/routes/extensions/extensions-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const extensionsRouteComponentInjectable = getInjectable({
  id: "extensions-route-component",

  instantiate: (di) => ({
    route: di.inject(extensionsRouteInjectable),
    Component: Extensions,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default extensionsRouteComponentInjectable;
