/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import serviceAccountApiInjectable from "../../../../common/k8s-api/endpoints/service-account.api.injectable";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";
import apiManagerInjectable from "../../kube-object-menu/dependencies/api-manager.injectable";
import { ServiceAccountStore } from "./store";

const serviceAccountStoreInjectable = getInjectable({
  id: "service-account-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "serviceAccountStore is only available in certain environments");

    const api = di.inject(serviceAccountApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new ServiceAccountStore(api);

    apiManager.registerStore(store);

    return store;
  },
});

export default serviceAccountStoreInjectable;
