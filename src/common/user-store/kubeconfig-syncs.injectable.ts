/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "./user-store.injectable";

const kubeconfigSyncsInjectable = getInjectable({
  id: "kubeconfig-syncs",
  instantiate: (di) => {
    const store = di.inject(userStoreInjectable);

    return store.syncKubeconfigEntries;
  },
});

export default kubeconfigSyncsInjectable;
