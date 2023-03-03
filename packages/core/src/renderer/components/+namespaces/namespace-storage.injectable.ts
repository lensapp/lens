/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { isDefined } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

const selectedNamespaceStorageInjectable = getInjectable({
  id: "selected-namespace-storage",
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const defaultSelectedNamespaces = context.allNamespaces.includes("default")
      ? ["default"]
      : [context.allNamespaces[0]].filter(isDefined);

    return createStorage("selected_namespaces", defaultSelectedNamespaces);
  },
});

export default selectedNamespaceStorageInjectable;
