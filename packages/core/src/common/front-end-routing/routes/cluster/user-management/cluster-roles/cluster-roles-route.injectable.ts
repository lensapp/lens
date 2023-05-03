/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const clusterRolesRouteInjectable = getFrontEndRouteInjectable({
  id: "cluster-roles-route",
  path: "/cluster-roles",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    apiName: "clusterroles",
    group: "rbac.authorization.k8s.io",
  }),
});

export default clusterRolesRouteInjectable;
