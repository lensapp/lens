/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import horizontalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/horizontal-pod-autoscalers/horizontal-pod-autoscalers-route.injectable";
import { HorizontalPodAutoscalers } from "./list-view";

const horizontalPodAutoscalersRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "horizontal-pod-autoscalers-route-component",
  Component: HorizontalPodAutoscalers,
  routeInjectable: horizontalPodAutoscalersRouteInjectable,
});

export default horizontalPodAutoscalersRouteComponentInjectable;
