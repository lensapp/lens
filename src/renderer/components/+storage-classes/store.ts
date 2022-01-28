/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { StorageClass, StorageClassApi } from "../../../common/k8s-api/endpoints/storage-class.api";
import type { PersistentVolumeStore } from "../+persistent-volumes/store";

export interface StorageClassStoreDependencies {
  persistentVolumeStore: PersistentVolumeStore;
}

export class StorageClassStore extends KubeObjectStore<StorageClass> {
  constructor(public readonly api:StorageClassApi, protected dependencies: StorageClassStoreDependencies) {
    super();
    autoBind(this);
  }

  getPersistentVolumes(storageClass: StorageClass) {
    return this.dependencies.persistentVolumeStore.getByStorageClass(storageClass);
  }
}
