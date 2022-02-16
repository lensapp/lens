/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import kubernetesPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/kubernetes/kubernetes-preferences-route.injectable";
import { Kubernetes } from "./kubernetes";

const kubernetesPreferencesRouteComponentInjectable = getInjectable({
  id: "kubernetes-preferences-route-component",

  instantiate: (di) => ({
    route: di.inject(kubernetesPreferencesRouteInjectable),
    Component: Kubernetes,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default kubernetesPreferencesRouteComponentInjectable;
