/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Lease, LeaseApi } from "../../../common/k8s-api/endpoints/lease.api";

export class LeaseStore extends KubeObjectStore<Lease, LeaseApi> {
}
