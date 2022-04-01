/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Roles } from "./view";
import rolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/roles-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../../routes/route-specific-component-injection-token";

const rolesRouteComponentInjectable = getInjectable({
  id: "roles-route-component",

  instantiate: (di) => ({
    route: di.inject(rolesRouteInjectable),
    Component: Roles,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default rolesRouteComponentInjectable;
