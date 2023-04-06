/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import horizontalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/horizontal-pod-autoscalers/horizontal-pod-autoscalers-route.injectable";
import { HorizontalPodAutoscalers } from "./list-view";

const horizontalPodAutoscalersRouteComponentInjectable = getInjectable({
  id: "horizontal-pod-autoscalers-route-component",

  instantiate: (di) => ({
    route: di.inject(horizontalPodAutoscalersRouteInjectable),
    Component: HorizontalPodAutoscalers,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default horizontalPodAutoscalersRouteComponentInjectable;
