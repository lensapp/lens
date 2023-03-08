/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterContext } from "./cluster-frame-context";
import allNamespacesInjectable from "./all-namespaces.injectable";
import selectedNamespacesForFilteringInjectable from "./selected-namespaces.injectable";
import areAllNamespacesSelectedInjectable from "./are-all-namespaces-selected.injectable";
import isNamespaceListSufficientToLoadFromAllNamespacesInjectable from "./is-loading-all.injectable";
import globalWatchEnabledInjectable from "./global-watch-enabled.injectable";

const clusterFrameContextForNamespacedResourcesInjectable = getInjectable({
  id: "cluster-frame-context-for-namespaced-resources",

  instantiate: (di): ClusterContext => {
    const allNamespaces = di.inject(allNamespacesInjectable);
    const contextNamespaces = di.inject(selectedNamespacesForFilteringInjectable);
    const areAllNamespacesSelected = di.inject(areAllNamespacesSelectedInjectable);
    const globalWatchEnabled = di.inject(globalWatchEnabledInjectable);

    return {
      isLoadingAll: di.inject(isNamespaceListSufficientToLoadFromAllNamespacesInjectable),
      isGlobalWatchEnabled: () => globalWatchEnabled.get(),
      get allNamespaces() {
        return allNamespaces.get();
      },
      get contextNamespaces() {
        return contextNamespaces.get();
      },
      get hasSelectedAll() {
        return areAllNamespacesSelected.get();
      },
    };
  },
});

export default clusterFrameContextForNamespacedResourcesInjectable;
