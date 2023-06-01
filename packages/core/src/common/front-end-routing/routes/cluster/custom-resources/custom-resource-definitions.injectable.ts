/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { shouldShowResourceInjectionToken } from "../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { getFrontEndRouteInjectable } from "../../../front-end-route-injection-token";

const customResourceDefinitionsRouteInjectable = getFrontEndRouteInjectable({
  id: "custom-resource-definitions-route",
  path: "/crd/definitions",
  clusterFrame: true,
  isEnabled: (di) => di.inject(shouldShowResourceInjectionToken, {
    group: "apiextensions.k8s.io",
    apiName: "customresourcedefinitions",
  }),
});

export default customResourceDefinitionsRouteInjectable;
