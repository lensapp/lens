/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import hostedClusterInjectable from "../cluster-frame-context/hosted-cluster.injectable";

const clusterConfiguredAccessibleNamespacesInjectable = getInjectable({
  id: "cluster-configured-accessible-namespaces",
  instantiate: (di) => {
    const hostedCluster = di.inject(hostedClusterInjectable);

    return computed(() => [...hostedCluster?.accessibleNamespaces ?? []]);
  },
});

export default clusterConfiguredAccessibleNamespacesInjectable;
