/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import resourceQuotaApiInjectable from "../../../common/k8s-api/endpoints/resource-quota.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { ResourceQuotaStore } from "./store";

const resourceQuotaStoreInjectable = getInjectable({
  id: "resource-quota-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "resourceQuotaStore is only available in certain environments");

    const api = di.inject(resourceQuotaApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new ResourceQuotaStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default resourceQuotaStoreInjectable;
