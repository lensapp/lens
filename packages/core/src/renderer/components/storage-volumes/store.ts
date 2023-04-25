/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { PersistentVolume, PersistentVolumeApi } from "../../../common/k8s-api/endpoints/persistent-volume.api";
import type { StorageClass } from "../../../common/k8s-api/endpoints/storage-class.api";

export class PersistentVolumeStore extends KubeObjectStore<PersistentVolume, PersistentVolumeApi> {
  getByStorageClass(storageClass: StorageClass): PersistentVolume[] {
    const storageClassName = storageClass.getName();

    return this.items
      .filter(volume => volume.getStorageClassName() === storageClassName);
  }
}
