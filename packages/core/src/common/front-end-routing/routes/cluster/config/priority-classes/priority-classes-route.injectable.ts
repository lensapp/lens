/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const priorityClassesRouteInjectable = getInjectable({
  id: "priority-classes-route",

  instantiate: (di) => ({
    path: "/priorityclasses",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "priorityclasses",
      group: "scheduling.k8s.io",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default priorityClassesRouteInjectable;
