/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { RoleBindings } from "./view";
import roleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/role-bindings/role-bindings-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../../routes/route-specific-component-injection-token";

const roleBindingsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "role-bindings-route-component",
  Component: RoleBindings,
  routeInjectable: roleBindingsRouteInjectable,
});

export default roleBindingsRouteComponentInjectable;
