/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { PersistentVolumeClaim, PersistentVolumeClaimApi } from "../../../common/k8s-api/endpoints";
import { persistentVolumeClaimApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export class PersistentVolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim, PersistentVolumeClaimApi> {
}

export const persistentVolumeClaimStore = new PersistentVolumeClaimStore(persistentVolumeClaimApi);
apiManager.registerStore(persistentVolumeClaimStore);
