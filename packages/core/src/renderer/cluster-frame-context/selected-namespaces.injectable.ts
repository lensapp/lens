/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import selectedNamespacesStorageInjectable from "../../features/namespace-filtering/renderer/storage.injectable";
import allNamespacesInjectable from "./all-namespaces.injectable";

const selectedNamespacesForFilteringInjectable = getInjectable({
  id: "selected-namespaces-for-filtering",
  instantiate: (di) => {
    const selectedNamespacesStorage = di.inject(selectedNamespacesStorageInjectable);
    const allNamespaces = di.inject(allNamespacesInjectable);

    return computed(() => {
      const selectedNamespaces = selectedNamespacesStorage.get();

      return selectedNamespaces.length > 0
        ? selectedNamespaces
        : allNamespaces.get();
    });
  },
});

export default selectedNamespacesForFilteringInjectable;
