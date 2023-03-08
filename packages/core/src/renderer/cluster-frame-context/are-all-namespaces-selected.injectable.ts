/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { computed } from "mobx";
import allNamespacesInjectable from "./all-namespaces.injectable";
import hostedClusterInjectable from "./hosted-cluster.injectable";
import selectedNamespacesForFilteringInjectable from "./selected-namespaces.injectable";

const areAllNamespacesSelectedInjectable = getInjectable({
  id: "are-all-namespaces-selected",
  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    const allNamespaces = di.inject(allNamespacesInjectable);
    const contextNamespaces = di.inject(selectedNamespacesForFilteringInjectable);

    return computed(() => {
      const namespaces = new Set(contextNamespaces.get());

      return allNamespaces.get().length > 1
        && cluster.accessibleNamespaces.length === 0
        && allNamespaces.get().every(ns => namespaces.has(ns));
    });
  },
});

export default areAllNamespacesSelectedInjectable;
