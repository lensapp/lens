/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import persistentVolumeClaimApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { PersistentVolumeClaimStore } from "./store";

const persistentVolumeClaimStoreInjectable = getInjectable({
  id: "persistent-volume-claim-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "persistentVolumeClaimStore is only available in certain environments");

    const api = di.inject(persistentVolumeClaimApiInjectable);

    return new PersistentVolumeClaimStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default persistentVolumeClaimStoreInjectable;
