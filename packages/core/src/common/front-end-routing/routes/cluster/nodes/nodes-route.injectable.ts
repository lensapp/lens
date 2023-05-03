/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { getFrontEndRouteInjectable } from "../../../front-end-route-injection-token";

const nodesRouteInjectable = getFrontEndRouteInjectable({
  id: "nodes-route",
  path: "/nodes",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    apiName: "nodes",
    group: "",
  }),
});

export default nodesRouteInjectable;
