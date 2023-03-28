/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const cronJobsRouteInjectable = getInjectable({
  id: "cron-jobs-route",

  instantiate: (di) => ({
    path: "/cronjobs",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "cronjobs",
      group: "batch",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default cronJobsRouteInjectable;
