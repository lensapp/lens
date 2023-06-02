/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import getPersistentVolumesByStorageClassInjectable from "../storage-volumes/get-persistent-volumes-by-storage-class.injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { storageClassApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForClusterScopedResourcesInjectable from "../../cluster-frame-context/for-cluster-scoped-resources.injectable";
import { StorageClassStore } from "./store";

const storageClassStoreInjectable = getInjectable({
  id: "storage-class-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "storageClassStore is only available in certain environments");

    const api = di.inject(storageClassApiInjectable);

    return new StorageClassStore({
      getPersistentVolumesByStorageClass: di.inject(getPersistentVolumesByStorageClassInjectable),
      context: di.inject(clusterFrameContextForClusterScopedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default storageClassStoreInjectable;
