/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodsByOwnerIdInjectable from "../+workloads-pods/get-pods-by-owner-id.injectable";
import replicaSetApiInjectable from "../../../common/k8s-api/endpoints/replica-set.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { ReplicaSetStore } from "./store";

const replicaSetStoreInjectable = getInjectable({
  id: "replica-set-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "replicaSetStore is only available in certain environments");

    const api = di.inject(replicaSetApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new ReplicaSetStore({
      getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
    }, api);

    apiManager.registerStore(store);

    return store;
  },
});

export default replicaSetStoreInjectable;
