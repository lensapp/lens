/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmReleasesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import routePathParametersInjectable from "../../../routes/route-path-parameters.injectable";

export interface TargetHelmRelease {
  name: string;
  namespace: string;
}

const targetHelmReleaseInjectable = getInjectable({
  id: "target-helm-release",

  instantiate: (di) => {
    const route = di.inject(helmReleasesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return computed((): TargetHelmRelease | undefined => {
      const { name, namespace } = pathParameters.get() ?? {};

      if (name && namespace) {
        return {
          name,
          namespace,
        };
      }

      return undefined;
    });
  },
});

export default targetHelmReleaseInjectable;
