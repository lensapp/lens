/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Leases } from "./leases";
import leasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/leases/leases-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const leasesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "leases-route-component",
  routeInjectable: leasesRouteInjectable,
  Component: Leases,
});

export default leasesRouteComponentInjectable;
