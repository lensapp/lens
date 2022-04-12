/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodsByOwnerIdInjectable from "../+workloads-pods/get-pods-by-owner-id.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import statefulSetApiInjectable from "../../../common/k8s-api/endpoints/stateful-set.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { StatefulSetStore } from "./store";

const statefulSetStoreInjectable = getInjectable({
  id: "stateful-set-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "statefulSetStore is only available in certain environment");

    const api = di.inject(statefulSetApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new StatefulSetStore({
      getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
    }, api);

    apiManager.registerStore(store);

    return store;
  },
});

export default statefulSetStoreInjectable;
