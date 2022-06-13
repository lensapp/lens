/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import { listReleases } from "../../../common/k8s-api/endpoints/helm-releases.api";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import releaseSecretsInjectable from "./release-secrets.injectable";

const releasesInjectable = getInjectable({
  id: "releases",

  instantiate: (di) => {
    const clusterContext = di.inject(clusterFrameContextInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const releaseSecrets = di.inject(releaseSecretsInjectable);

    return asyncComputed(async () => {
      const contextNamespaces = namespaceStore.contextNamespaces || [];

      void releaseSecrets.get();

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
