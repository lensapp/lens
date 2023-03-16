/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const storageClassesRouteInjectable = getInjectable({
  id: "storage-classes-route",

  instantiate: (di) => ({
    path: "/storage-classes",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "storageclasses",
      group: "storage.k8s.io",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default storageClassesRouteInjectable;
