/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { VerticalPodAutoscalerApi } from "../../../common/k8s-api/endpoints/vertical-pod-autoscaler.api";
import type { VerticalPodAutoscaler } from "@k8slens/kube-object";

export class VerticalPodAutoscalerStore extends KubeObjectStore<VerticalPodAutoscaler, VerticalPodAutoscalerApi> {
}
