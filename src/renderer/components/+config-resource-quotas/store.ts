/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ResourceQuota, ResourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";

export class ResourceQuotaStore extends KubeObjectStore<ResourceQuota, ResourceQuotaApi> {
}
