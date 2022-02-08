/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import releasesInjectable from "../releases.injectable";
import releaseRouteParametersInjectable from "./release-route-parameters.injectable";
import { computed } from "mobx";

const releaseInjectable = getInjectable({
  instantiate: (di) => {
    const releases = di.inject(releasesInjectable);
    const releaseRouteParameters = di.inject(releaseRouteParametersInjectable);

    return computed(() => {
      const { name, namespace } = releaseRouteParameters.get();

      if (!name || !namespace) {
        return null;
      }

      return releases.value.get().find(matches({ name, namespace }));
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default releaseInjectable;
