/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import daemonSetStoreInjectable from "./store.injectable";

const totalCountOfDaemonSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-daemon-sets-in-selected-namespaces",
  instantiate: (di) => {
    const daemonSetStore = di.inject(daemonSetStoreInjectable);

    return computed(() => daemonSetStore.getTotalCount());
  },
});

export default totalCountOfDaemonSetsInSelectedNamespacesInjectable;
