/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterRoleBindings } from "./view";
import clusterRoleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/cluster-role-bindings-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../../routes/route-specific-component-injection-token";

const clusterRoleBindingsRouteComponentInjectable = getInjectable({
  id: "cluster-role-bindings-route-component",

  instantiate: (di) => ({
    route: di.inject(clusterRoleBindingsRouteInjectable),
    Component: ClusterRoleBindings,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default clusterRoleBindingsRouteComponentInjectable;
