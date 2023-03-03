/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { NamespaceScopedClusterContext } from "./cluster-frame-context";
import hostedClusterInjectable from "./hosted-cluster.injectable";
import assert from "assert";
import { computed } from "mobx";
import selectedNamespaceStorageInjectable from "../components/+namespaces/namespace-storage.injectable";
import { toggle } from "../utils";
import allNamespacesInjectable from "./all-namespaces.injectable";

const clusterFrameContextForNamespacedResourcesInjectable = getInjectable({
  id: "cluster-frame-context-for-namespaced-resources",

  instantiate: (di): NamespaceScopedClusterContext => {
    const cluster = di.inject(hostedClusterInjectable);
    const selectedNamespaceStorage = di.inject(selectedNamespaceStorageInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    const allNamespaces = di.inject(allNamespacesInjectable);
    const contextNamespaces = computed(() => {
      const storedState = selectedNamespaceStorage.get();

      if (!storedState || storedState.length === 0) {
        return allNamespaces.get();
      }

      const state = new Set(storedState);
      const currentlyKnownNamespaces = new Set(allNamespaces.get());

      for (const namespace of storedState) {
        if (!currentlyKnownNamespaces.has(namespace)) {
          state.delete(namespace);
        }
      }

      return [...state];
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
      isGlobalWatchEnabled: () => cluster.isGlobalWatchEnabled,
      selectAllNamespaces: () => {
        selectedNamespaceStorage.set([]);
      },
      selectNamespace: (namespace) => {
        selectedNamespaceStorage.set([namespace]);
      },
      toggleNamespace: (namespace) => {
        const nextState = new Set(contextNamespaces.get());

        toggle(nextState, namespace);
        selectedNamespaceStorage.set([...nextState]);
      },
      deselectNamespace: (namespace) => {
        const nextState = new Set(contextNamespaces.get());

        nextState.delete(namespace);
        selectedNamespaceStorage.set([...nextState]);
      },
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
