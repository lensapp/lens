/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterContext } from "./cluster-frame-context";
import namespaceStoreInjectable from "../components/namespaces/store.injectable";
import hostedClusterInjectable from "./hosted-cluster.injectable";
import assert from "assert";
import { computed } from "mobx";
import selectedNamespacesStorageInjectable from "../../features/namespace-filtering/renderer/storage.injectable";

const clusterFrameContextForNamespacedResourcesInjectable = getInjectable({
  id: "cluster-frame-context-for-namespaced-resources",

  instantiate: (di): ClusterContext => {
    const cluster = di.inject(hostedClusterInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const selectedNamespacesStorage = di.inject(selectedNamespacesStorageInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    const allNamespaces = computed(() => {
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
    const contextNamespaces = computed(() => {
      const selectedNamespaces = selectedNamespacesStorage.get();

      return selectedNamespaces.length > 0
        ? selectedNamespaces
        : allNamespaces.get();
    });
    const hasSelectedAll = computed(() => {
      const namespaces = new Set(contextNamespaces.get());

      return allNamespaces.get().length > 1
        && cluster.accessibleNamespaces.length === 0
        && allNamespaces.get().every(ns => namespaces.has(ns));
    });

    return {
      isLoadingAll: (namespaces) => (
        allNamespaces.get().length > 1
        && cluster.accessibleNamespaces.length === 0
        && allNamespaces.get().every(ns => namespaces.includes(ns))
      ),
      isGlobalWatchEnabled: () => cluster.isGlobalWatchEnabled.get(),
      get allNamespaces() {
        return allNamespaces.get();
      },
      get contextNamespaces() {
        return contextNamespaces.get();
      },
      get hasSelectedAll() {
        return hasSelectedAll.get();
      },
    };
  },
});

export default clusterFrameContextForNamespacedResourcesInjectable;
