/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPodsByOwnerIdInjectable from "../+workloads-pods/get-pods-by-owner-id.injectable";
import daemonSetApiInjectable from "../../../common/k8s-api/endpoints/daemon-set.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import { DaemonSetStore } from "./store";

const daemonSetStoreInjectable = getInjectable({
  id: "daemon-set-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "daemonSetStore is only available in certain environments");

    const api = di.inject(daemonSetApiInjectable);

    return new DaemonSetStore({
      getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default daemonSetStoreInjectable;
