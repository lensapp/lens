/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const podDisruptionBudgetsRouteInjectable = getFrontEndRouteInjectable({
  id: "pod-disruption-budgets-route",
  path: "/poddisruptionbudgets",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    apiName: "poddisruptionbudgets",
    group: "policy",
  }),
});

export default podDisruptionBudgetsRouteInjectable;
