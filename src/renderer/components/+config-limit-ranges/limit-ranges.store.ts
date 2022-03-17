/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { LimitRange, LimitRangeApi } from "../../../common/k8s-api/endpoints/limit-range.api";
import { limitRangeApi } from "../../../common/k8s-api/endpoints/limit-range.api";
import { isClusterPageContext } from "../../utils";

export class LimitRangeStore extends KubeObjectStore<LimitRange, LimitRangeApi> {
}

export const limitRangeStore = isClusterPageContext()
  ? new LimitRangeStore(limitRangeApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(limitRangeStore);
}
