/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { StorageClass, StorageClassApi, StorageClassData } from "../../../common/k8s-api/endpoints/storage-class.api";
import type { GetPersistentVolumesByStorageClass } from "../+storage-volumes/get-persisten-volumes-by-storage-class.injectable";

export interface StorageClassStoreDependencies {
  getPersistentVolumesByStorageClass: GetPersistentVolumesByStorageClass;
}

export class StorageClassStore extends KubeObjectStore<StorageClass, StorageClassApi, StorageClassData> {
  constructor(
    protected readonly dependencies: StorageClassStoreDependencies,
    api: StorageClassApi,
    opts?: KubeObjectStoreOptions,
  ) {
    super(api, opts);
  }

  getPersistentVolumes(storageClass: StorageClass) {
    return this.dependencies.getPersistentVolumesByStorageClass(storageClass);
  }
}
