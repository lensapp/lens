/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import deploymentStoreInjectable from "./store.injectable";

const totalCountOfDeploymentsInSelectedNamespacesInjectable = getInjectable({
  id: "total-count-of-deployments-in-selected-namespaces",
  instantiate: (di) => {
    const deploymentStore = di.inject(deploymentStoreInjectable);

    return computed(() => deploymentStore.getTotalCount());
  },
});

export default totalCountOfDeploymentsInSelectedNamespacesInjectable;
