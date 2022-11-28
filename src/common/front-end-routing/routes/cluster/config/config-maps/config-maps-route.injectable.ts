/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import shouldShowResourceInjectable from "../../../../../../renderer/cluster-frame-context/should-show-resource.injectable";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const configMapsRouteInjectable = getInjectable({
  id: "config-maps-route",
  instantiate: (di) => ({
    path: "/configmaps",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectable, {
      apiName: "configmaps",
    }),
  }),
  injectionToken: frontEndRouteInjectionToken,
});

export default configMapsRouteInjectable;
