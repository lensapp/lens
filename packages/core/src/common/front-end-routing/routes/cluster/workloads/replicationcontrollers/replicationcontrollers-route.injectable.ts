/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const replicationControllersRouteInjectable = getInjectable({
  id: "replicationcontrollers-route",

  instantiate: (di) => ({
    path: "/replicationcontrollers",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "replicationcontrollers",
      group: "", // core
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default replicationControllersRouteInjectable;
