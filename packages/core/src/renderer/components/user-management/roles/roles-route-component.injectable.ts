/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Roles } from "./view";
import rolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/roles-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../../routes/route-specific-component-injection-token";

const rolesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "roles-route-component",
  Component: Roles,
  routeInjectable: rolesRouteInjectable,
});

export default rolesRouteComponentInjectable;
