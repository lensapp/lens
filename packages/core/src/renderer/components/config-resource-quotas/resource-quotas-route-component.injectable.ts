/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ResourceQuotas } from "./resource-quotas";
import resourceQuotasRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/resource-quotas-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const resourceQuotasRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "resource-quotas-route-component",
  Component: ResourceQuotas,
  routeInjectable: resourceQuotasRouteInjectable,
});

export default resourceQuotasRouteComponentInjectable;
