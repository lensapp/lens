/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ResourceQuotas } from "./resource-quotas";
import resourceQuotasRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/resource-quotas-route.injectable";
import {
  routeSpecificComponentInjectionToken,
} from "../../routes/route-specific-component-injection-token";

const resourceQuotasRouteComponentInjectable = getInjectable({
  id: "resource-quotas-route-component",

  instantiate: (di) => ({
    route: di.inject(resourceQuotasRouteInjectable),
    Component: ResourceQuotas,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default resourceQuotasRouteComponentInjectable;
