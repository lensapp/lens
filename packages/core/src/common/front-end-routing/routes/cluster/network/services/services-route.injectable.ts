/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const servicesRouteInjectable = getInjectable({
  id: "services-route",

  instantiate: (di) => ({
    path: "/services",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "services",
      group: "",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default servicesRouteInjectable;
