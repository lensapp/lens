/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ClusterRoles } from "./view";
import clusterRolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-roles/cluster-roles-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../../routes/route-specific-component-injection-token";

const clusterRolesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "cluster-roles-route-component",
  Component: ClusterRoles,
  routeInjectable: clusterRolesRouteInjectable,
});

export default clusterRolesRouteComponentInjectable;
