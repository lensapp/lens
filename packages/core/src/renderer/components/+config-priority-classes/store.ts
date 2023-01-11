/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { PriorityClass, PriorityClassApi } from "../../../common/k8s-api/endpoints/priority-class.api";

export class PriorityClassStore extends KubeObjectStore<PriorityClass, PriorityClassApi> {
}
