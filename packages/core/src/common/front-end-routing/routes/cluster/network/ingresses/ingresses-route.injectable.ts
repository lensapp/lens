/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { computedOr } from "@k8slens/utilities";
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const ingressesRouteInjectable = getFrontEndRouteInjectable({
  id: "ingresses-route",
  path: "/ingresses",
  clusterFrame: true,
  isEnabled: (di) => computedOr(
    di.inject(shouldShowResourceInjectionToken, {
      apiName: "ingresses",
      group: "networking.k8s.io",
    }),
    di.inject(shouldShowResourceInjectionToken, {
      apiName: "ingresses",
      group: "extensions",
    }),
  ),
});

export default ingressesRouteInjectable;
