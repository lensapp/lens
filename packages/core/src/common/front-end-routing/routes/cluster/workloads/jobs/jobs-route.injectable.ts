/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const jobsRouteInjectable = getInjectable({
  id: "jobs-route",

  instantiate: (di) => ({
    path: "/jobs",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "jobs",
      group: "batch",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default jobsRouteInjectable;
