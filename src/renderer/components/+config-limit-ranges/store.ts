/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { LimitRange, LimitRangeApi } from "../../../common/k8s-api/endpoints/limit-range.api";

export class LimitRangeStore extends KubeObjectStore<LimitRange, LimitRangeApi> {
}
