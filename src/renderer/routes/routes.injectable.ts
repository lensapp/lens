/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import currentlyInClusterFrameInjectable from "./currently-in-cluster-frame.injectable";
import allRoutesInjectable from "./all-routes.injectable";
import { matches } from "lodash/fp";

const routesInjectable = getInjectable({
  id: "routes",

  instantiate: (di) => {
    const allRoutes = di.inject(allRoutesInjectable);
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);

    return computed(() =>
      allRoutes
        .get()
        .filter(matches({ clusterFrame: currentlyInClusterFrame }))
        .filter((route) => route.isEnabled.get()),
    );
  },
});

export default routesInjectable;
