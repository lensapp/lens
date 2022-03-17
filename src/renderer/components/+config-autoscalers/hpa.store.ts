/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { HorizontalPodAutoscaler, HorizontalPodAutoscalerApi } from "../../../common/k8s-api/endpoints/hpa.api";
import { horizontalPodAutoscalerApi } from "../../../common/k8s-api/endpoints/hpa.api";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class HorizontalPodAutoscalerStore extends KubeObjectStore<HorizontalPodAutoscaler, HorizontalPodAutoscalerApi> {
}

export const hpaStore = isClusterPageContext()
  ? new HorizontalPodAutoscalerStore(horizontalPodAutoscalerApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(hpaStore);
}
