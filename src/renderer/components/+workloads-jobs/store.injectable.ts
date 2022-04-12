/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodsByOwnerIdInjectable from "../+workloads-pods/get-pods-by-owner-id.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import jobApiInjectable from "../../../common/k8s-api/endpoints/job.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { JobStore } from "./store";

const jobStoreInjectable = getInjectable({
  id: "job-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "jobStore is only available in certain environments");

    const api = di.inject(jobApiInjectable);
    const apiManager = di.inject(apiManagerInjectable);
    const store = new JobStore({
      getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
    }, api);

    apiManager.registerStore(store);

    return store;
  },
});

export default jobStoreInjectable;
