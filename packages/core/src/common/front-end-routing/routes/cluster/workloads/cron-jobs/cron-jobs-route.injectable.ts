/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const cronJobsRouteInjectable = getFrontEndRouteInjectable({
  id: "cron-jobs-route",
  path: "/cronjobs",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    apiName: "cronjobs",
    group: "batch",
  }),
});

export default cronJobsRouteInjectable;
