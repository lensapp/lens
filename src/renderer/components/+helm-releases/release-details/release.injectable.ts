/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import releasesInjectable from "../releases.injectable";
import { computed } from "mobx";
import helmReleasesRouteParametersInjectable from "../helm-releases-route-parameters.injectable";

const releaseInjectable = getInjectable({
  id: "release",

  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);
    const routeParameters = di.inject(helmReleasesRouteParametersInjectable);

    return computed(() => {
      const name = routeParameters.name.get();
      const namespace = routeParameters.namespace.get();

      if (!name || !namespace) {
        return null;
      }

      return releases.value.get().find(matches({ name, namespace }));
    });
  },
});

export default releaseInjectable;
