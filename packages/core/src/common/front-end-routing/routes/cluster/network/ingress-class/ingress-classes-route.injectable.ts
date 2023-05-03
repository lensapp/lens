/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";

const ingressClassesRouteInjectable = getFrontEndRouteInjectable({
  id: "ingress-classes-route",
  path: "/ingress-classes",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    apiName: "ingressclasses",
    group: "networking.k8s.io",
  }),
});

export default ingressClassesRouteInjectable;
