/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../cluster-frame-context/for-namespaced-resources.injectable";

export type FilterByNamespace = (namespace: string) => void;

const filterByNamespaceInjectable = getInjectable({
  id: "filter-by-namespace",
  instantiate: (di): FilterByNamespace => {
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);

    return (namespace) => context.selectNamespace(namespace);
  },
});

export default filterByNamespaceInjectable;
