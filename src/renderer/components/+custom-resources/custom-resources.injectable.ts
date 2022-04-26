/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import customResourceDefinitionStoreInjectable from "./definition.store.injectable";

const customResourceDefinitionsInjectable = getInjectable({
  id: "custom-resource-definitions",

  instantiate: (di) => {
    const createStoresAndApis = di.inject(createStoresAndApisInjectable);

    if (!createStoresAndApis) {
      return computed(() => []);
    }

    const store = di.inject(customResourceDefinitionStoreInjectable);
    const subscribeStores = di.inject(subscribeStoresInjectable);

    subscribeStores([store]);

    return computed(() => [...store.items]);
  },
});

export default customResourceDefinitionsInjectable;
