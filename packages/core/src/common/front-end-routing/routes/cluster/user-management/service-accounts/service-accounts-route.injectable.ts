/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const serviceAccountsRouteInjectable = getInjectable({
  id: "service-accounts-route",

  instantiate: (di) => ({
    path: "/service-accounts",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "serviceaccounts",
      group: "",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default serviceAccountsRouteInjectable;
