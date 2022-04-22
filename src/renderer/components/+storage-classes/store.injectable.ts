/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPersistentVolumesByStorageClassInjectable from "../+storage-volumes/get-persisten-volumes-by-storage-class.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/manager.injectable";
import storageClassApiInjectable from "../../../common/k8s-api/endpoints/storage-class.api.injectable";
import createStoresAndApisInjectable from "../../create-stores-apis.injectable";
import { StorageClassStore } from "./store";

const storageClassStoreInjectable = getInjectable({
  id: "storage-class-store",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectable), "storageClassStore is only available in certain environments");

    const api = di.inject(storageClassApiInjectable);

    return new StorageClassStore({
      getPersistentVolumesByStorageClass: di.inject(getPersistentVolumesByStorageClassInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default storageClassStoreInjectable;
