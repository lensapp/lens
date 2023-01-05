/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../cluster-store/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const podsRouteInjectable = getInjectable({
  id: "pods-route",

  instantiate: (di) => ({
    path: "/pods",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "pods",
      group: "v1",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default podsRouteInjectable;
