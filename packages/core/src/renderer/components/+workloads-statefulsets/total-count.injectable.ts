/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import statefulSetStoreInjectable from "./store.injectable";

const totalCountOfStatefulSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-stateful-sets-in-selected-namespaces",
  instantiate: (di) => {
    const statefulSetStore = di.inject(statefulSetStoreInjectable);

    return computed(() => statefulSetStore.getTotalCount());
  },
});

export default totalCountOfStatefulSetsInSelectedNamespacesInjectable;
