/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { HorizontalPodAutoscaler, hpaApi } from "../../../common/k8s-api/endpoints/hpa.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class HPAStore extends KubeObjectStore<HorizontalPodAutoscaler> {
  api = hpaApi;
}

export const hpaStore = new HPAStore();
apiManager.registerStore(hpaStore);
