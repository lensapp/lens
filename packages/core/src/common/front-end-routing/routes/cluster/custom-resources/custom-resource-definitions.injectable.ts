/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../front-end-route-injection-token";

const customResourceDefinitionsRouteInjectable = getInjectable({
  id: "custom-resource-definitions-route",

  instantiate: (di) => ({
    path: "/crd/definitions",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      group: "apiextensions.k8s.io",
      apiName: "customresourcedefinitions",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default customResourceDefinitionsRouteInjectable;
