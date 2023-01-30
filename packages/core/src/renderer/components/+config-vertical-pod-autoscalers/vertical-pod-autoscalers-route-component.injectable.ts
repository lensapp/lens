/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import verticalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/vertical-pod-autoscalers-route.injectable";
import { VerticalPodAutoscalers } from "./vpa";

const verticalPodAutoscalersRouteComponentInjectable = getInjectable({
  id: "vertical-pod-autoscalers-route-component",

  instantiate: (di) => ({
    route: di.inject(verticalPodAutoscalersRouteInjectable),
    Component: VerticalPodAutoscalers,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default verticalPodAutoscalersRouteComponentInjectable;
