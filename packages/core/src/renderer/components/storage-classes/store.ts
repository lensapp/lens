/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStoreDependencies, KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { StorageClass, StorageClassData } from "@k8slens/kube-object";
import type { GetPersistentVolumesByStorageClass } from "../storage-volumes/get-persistent-volumes-by-storage-class.injectable";
import type { StorageClassApi } from "../../../common/k8s-api/endpoints";

export interface StorageClassStoreDependencies extends KubeObjectStoreDependencies {
  getPersistentVolumesByStorageClass: GetPersistentVolumesByStorageClass;
}

export class StorageClassStore extends KubeObjectStore<StorageClass, StorageClassApi, StorageClassData> {
  constructor(
    protected readonly dependencies: StorageClassStoreDependencies,
    api: StorageClassApi,
    opts?: KubeObjectStoreOptions,
  ) {
    super(dependencies, api, opts);
  }

  getPersistentVolumes(storageClass: StorageClass) {
    return this.dependencies.getPersistentVolumesByStorageClass(storageClass);
  }
}
