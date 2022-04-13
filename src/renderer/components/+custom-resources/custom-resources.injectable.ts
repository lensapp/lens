/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import currentlyInClusterFrameInjectable from "../../routes/currently-in-cluster-frame.injectable";
import customResourceDefinitionStoreInjectable from "./definition.store.injectable";

const customResourceDefinitionsInjectable = getInjectable({
  id: "custom-resource-definitions",

  instantiate: (di) => {
    const currentlyInClusterFrame = di.inject(currentlyInClusterFrameInjectable);
    const store = di.inject(customResourceDefinitionStoreInjectable);

    if (currentlyInClusterFrame) {
      const subscribeStores = di.inject(subscribeStoresInjectable);

      subscribeStores([store]);
    }

    return computed(() => [...store.items]);
  },
});

export default customResourceDefinitionsInjectable;
