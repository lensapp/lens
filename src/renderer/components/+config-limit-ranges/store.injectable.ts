/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import limitRangeApiInjectable from "../../../common/k8s-api/endpoints/limit-range.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { LimitRangeStore } from "./store";

const limitRangeStoreInjectable = getInjectable({
  id: "limit-range-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "limitRangeStore is only available in certain environments");

    const api = di.inject(limitRangeApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new LimitRangeStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default limitRangeStoreInjectable;
