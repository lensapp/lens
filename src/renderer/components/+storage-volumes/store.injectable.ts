/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import persistentVolumeApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { PersistentVolumeStore } from "./store";

const persistentVolumeStoreInjectable = getInjectable({
  id: "persistent-volume-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "persistentVolumeStore is only available in certain environments");

    const api = di.inject(persistentVolumeApiInjectable);

    return new PersistentVolumeStore(api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default persistentVolumeStoreInjectable;
