/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmReleasesRouteParametersInjectable from "../helm-releases-route-parameters.injectable";

export interface TargetHelmRelease { name: string; namespace: string }

const targetHelmReleaseInjectable = getInjectable({
  id: "target-helm-release",

  instantiate: (di) => {
    const routeParameters = di.inject(helmReleasesRouteParametersInjectable);

    return computed((): TargetHelmRelease | undefined => {
      const name = routeParameters.name.get();
      const namespace = routeParameters.namespace.get();

      return name && namespace ? { name, namespace } : undefined;
    });
  },
});

export default targetHelmReleaseInjectable;
