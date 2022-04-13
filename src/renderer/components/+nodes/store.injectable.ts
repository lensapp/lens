/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { NodeStore } from "./store";

const nodeStoreInjectable = getInjectable({
  id: "node-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "nodeStore is only available in certain environments");

    const api = di.inject(nodeApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new NodeStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default nodeStoreInjectable;
