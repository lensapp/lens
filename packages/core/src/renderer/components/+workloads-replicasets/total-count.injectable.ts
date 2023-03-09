/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import replicaSetStoreInjectable from "./store.injectable";

const totalCountOfReplicaSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-replica-sets-in-selected-namespaces",
  instantiate: (di) => {
    const store = di.inject(replicaSetStoreInjectable);

    return computed(() => store.getTotalCount());
  },
});

export default totalCountOfReplicaSetsInSelectedNamespacesInjectable;
