/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import releaseSecretsInjectable from "./release-secrets.injectable";
import requestHelmReleasesInjectable from "../../../common/k8s-api/endpoints/helm-releases.api/request-releases.injectable";
import toHelmReleaseInjectable from "./to-helm-release.injectable";

const releasesInjectable = getInjectable({
  id: "releases",

  instantiate: (di) => {
    const clusterContext = di.inject(clusterFrameContextInjectable);
    const releaseSecrets = di.inject(releaseSecretsInjectable);
    const requestHelmReleases = di.inject(requestHelmReleasesInjectable);
    const toHelmRelease = di.inject(toHelmReleaseInjectable);

    return asyncComputed(async () => {
      void releaseSecrets.get();

      const releaseArrays = await (clusterContext.hasSelectedAll
        ? requestHelmReleases()
        : Promise.all(clusterContext.contextNamespaces.map(namespace => requestHelmReleases(namespace)))
      );

      return releaseArrays.flat().map(toHelmRelease);
    }, []);
  },
});


export default releasesInjectable;
