/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { listReleases } from "../../../common/k8s-api/endpoints/helm-release.api";
import frameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";

const releasesInjectable = getInjectable({
  instantiate: (di) => {
    const context = di.inject(frameContextInjectable);

    return asyncComputed(async () => {
      const releaseArrays = await (
        context.hasSelectedAll
          ? listReleases()
          : Promise.all(context.contextNamespaces.map(listReleases))
      );

      return releaseArrays.flat();
    }, []);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default releasesInjectable;
