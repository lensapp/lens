/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import releasesInjectable from "../releases.injectable";
import releaseRouteParametersInjectable from "./release-route-parameters.injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";

const releaseInjectable = getInjectable({
  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);
    const releaseRouteParameters = di.inject(releaseRouteParametersInjectable);

    return asyncComputed(async () => {
      const { name, namespace } = releaseRouteParameters.get();

      return releases.value.get().find(matches({ name, namespace }));
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default releaseInjectable;
