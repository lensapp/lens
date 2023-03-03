/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { computed } from "mobx";
import namespaceStoreInjectable from "../components/+namespaces/store.injectable";
import hostedClusterInjectable from "./hosted-cluster.injectable";

const allNamespacesInjectable = getInjectable({
  id: "all-namespaces",
  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    const namespaceStore = di.inject(namespaceStoreInjectable);

    return computed(() => {
      // user given list of namespaces
      if (cluster.accessibleNamespaces.length) {
        return cluster.accessibleNamespaces.slice();
      }

      if (namespaceStore.items.length > 0) {
        // namespaces from kubernetes api
        return namespaceStore.items.map((namespace) => namespace.getName());
      }

      // fallback to cluster resolved namespaces because we could not load list
      return cluster.allowedNamespaces.slice();
    });
  },
});

export default allNamespacesInjectable;
