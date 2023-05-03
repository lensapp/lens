/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ClusterRoleBindings } from "./view";
import clusterRoleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/cluster-role-bindings-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../../routes/route-specific-component-injection-token";

const clusterRoleBindingsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "cluster-role-bindings-route-component",
  Component: ClusterRoleBindings,
  routeInjectable: clusterRoleBindingsRouteInjectable,
});

export default clusterRoleBindingsRouteComponentInjectable;
