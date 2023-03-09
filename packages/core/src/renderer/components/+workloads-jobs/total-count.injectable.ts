/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import jobStoreInjectable from "./store.injectable";

const totalCountOfJobsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-jobs-in-selected-namespaces",
  instantiate: (di) => {
    const jobStore = di.inject(jobStoreInjectable);

    return computed(() => jobStore.getTotalCount());
  },
});

export default totalCountOfJobsInSelectedNamespacesInjectable;

