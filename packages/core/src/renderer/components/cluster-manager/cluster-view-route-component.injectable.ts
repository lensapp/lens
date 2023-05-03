/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ClusterView } from "./cluster-view";
import clusterViewRouteInjectable from "../../../common/front-end-routing/routes/cluster-view/cluster-view-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const clusterViewRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "cluster-view-route-component",
  Component: ClusterView,
  routeInjectable: clusterViewRouteInjectable,
});

export default clusterViewRouteComponentInjectable;
