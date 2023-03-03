/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import allNamespacesInjectable from "../../cluster-frame-context/all-namespaces.injectable";
import { isDefined } from "../../utils";
import createStorageInjectable from "../../utils/create-storage/create-storage.injectable";

const selectedNamespaceStorageInjectable = getInjectable({
  id: "selected-namespace-storage",
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);
    const allNamespaces = di.inject(allNamespacesInjectable);
    const defaultSelectedNamespaces = allNamespaces.get().includes("default")
      ? ["default"]
      : [allNamespaces.get()[0]].filter(isDefined);

    return createStorage("selected_namespaces", defaultSelectedNamespaces);
  },
});

export default selectedNamespaceStorageInjectable;
