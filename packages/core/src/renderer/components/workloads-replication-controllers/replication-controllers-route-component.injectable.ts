/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ReplicationControllers } from "./replication-controllers";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import replicationControllersRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replication-controllers/route.injectable";

const replicationControllersRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "replication-controller-route-component",
  Component: ReplicationControllers,
  routeInjectable: replicationControllersRouteInjectable,
});

export default replicationControllersRouteComponentInjectable;
