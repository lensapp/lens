/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import verticalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/vertical-pod-autoscalers-route.injectable";
import { VerticalPodAutoscalers } from "./vpa";

const verticalPodAutoscalersRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "vertical-pod-autoscalers-route-component",
  Component: VerticalPodAutoscalers,
  routeInjectable: verticalPodAutoscalersRouteInjectable,
});

export default verticalPodAutoscalersRouteComponentInjectable;
