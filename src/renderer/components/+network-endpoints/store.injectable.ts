/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import endpointsApiInjectable from "../../../common/k8s-api/endpoints/endpoint.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { EndpointsStore } from "./store";

const endpointsStoreInjectable = getInjectable({
  id: "endpoints-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "endpointsStore is only available in certain environments");

    const api = di.inject(endpointsApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new EndpointsStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default endpointsStoreInjectable;
