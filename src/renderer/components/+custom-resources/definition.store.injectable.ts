/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import customResourceDefinitionApiInjectable from "../../../common/k8s-api/endpoints/custom-resource-definition.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { CustomResourceDefinitionStore } from "./definition.store";
import initCustomResourceStoreInjectable from "./init-resource-store.injectable";

const customResourceDefinitionStoreInjectable = getInjectable({
  id: "custom-resource-definition-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "customResourceDefinitionStore is only available in certain environments");

    const api = di.inject(customResourceDefinitionApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new CustomResourceDefinitionStore({
      initCustomResourceStore: di.inject(initCustomResourceStoreInjectable),
    }, api);

    apiManager.registerStore(store);

    return store;
  },
});

export default customResourceDefinitionStoreInjectable;
