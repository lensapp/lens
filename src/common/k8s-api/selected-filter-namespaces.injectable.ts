/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import namespaceStoreInjectable from "../../renderer/components/+namespaces/store.injectable";
import { createStoresAndApisInjectionToken } from "./create-stores-apis.token";

const selectedFilterNamespacesInjectable = getInjectable({
  id: "selected-filter-namespaces",
  instantiate: (di) => {
    if (!di.inject(createStoresAndApisInjectionToken)) {
      // Dummy value so that this works in all environments
      return computed(() => []);
    }

    const store = di.inject(namespaceStoreInjectable);

    return computed(() => [...store.contextNamespaces]);
  },
});

export default selectedFilterNamespacesInjectable;
