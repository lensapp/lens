/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { LimitRange } from "../../../common/k8s-api/endpoints/limit-range.api";
import { limitRangeApi } from "../../../common/k8s-api/endpoints/limit-range.api";

export class LimitRangesStore extends KubeObjectStore<LimitRange> {
  api = limitRangeApi;
}

export const limitRangeStore = new LimitRangesStore();
apiManager.registerStore(limitRangeStore);
