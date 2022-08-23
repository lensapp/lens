/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { RoleBindings } from "./view";
import roleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/role-bindings/role-bindings-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../../routes/route-specific-component-injection-token";

const roleBindingsRouteComponentInjectable = getInjectable({
  id: "role-bindings-route-component",

  instantiate: (di) => ({
    route: di.inject(roleBindingsRouteInjectable),
    Component: RoleBindings,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default roleBindingsRouteComponentInjectable;
