/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import podStoreInjectable from "./store.injectable";

const totalCountOfPodsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-pods-in-selected-namespaces",
  instantiate: (di) => {
    const podStore = di.inject(podStoreInjectable);

    return computed(() => podStore.getTotalCount());
  },
});

export default totalCountOfPodsInSelectedNamespacesInjectable;
