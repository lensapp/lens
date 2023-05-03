/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { AddCluster } from "./add-cluster";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import addClusterRouteInjectable from "../../../common/front-end-routing/routes/add-cluster/add-cluster-route.injectable";

const addClusterRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "add-cluster-route-component",
  Component: AddCluster,
  routeInjectable: addClusterRouteInjectable,
});

export default addClusterRouteComponentInjectable;
