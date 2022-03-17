/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import { listReleases } from "../../../common/k8s-api/endpoints/helm-releases.api";

const releasesInjectable = getInjectable({
  id: "releases",

  instantiate: (di) => {
    const namespaceStore = di.inject(namespaceStoreInjectable);

    // TODO: Inject clusterContext directly instead of accessing dependency of a dependency
    const clusterContext = namespaceStore.context;

    return asyncComputed(async () => {
      const contextNamespaces = namespaceStore.contextNamespaces || [];

      const isLoadingAll =
        clusterContext.allNamespaces?.length > 1 &&
        clusterContext.cluster?.accessibleNamespaces.length === 0 &&
        clusterContext.allNamespaces.every((namespace) =>
          contextNamespaces.includes(namespace),
        );

      const releaseArrays = await (isLoadingAll ? listReleases() : Promise.all(
        contextNamespaces.map((namespace) =>
          listReleases(namespace),
        ),
      ));

      return releaseArrays.flat();
    }, []);
  },
});

export default releasesInjectable;
