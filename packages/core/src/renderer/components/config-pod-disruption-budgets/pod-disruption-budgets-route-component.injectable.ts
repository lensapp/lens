/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { PodDisruptionBudgets } from "./pod-disruption-budgets";
import podDisruptionBudgetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/pod-disruption-budgets-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const podDisruptionBudgetsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "pod-disruption-budgets-route-component",
  Component: PodDisruptionBudgets,
  routeInjectable: podDisruptionBudgetsRouteInjectable,
});

export default podDisruptionBudgetsRouteComponentInjectable;
