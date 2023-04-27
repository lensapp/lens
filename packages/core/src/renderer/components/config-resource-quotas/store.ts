/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ResourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";
import type { ResourceQuota } from "@k8slens/kube-object";

export class ResourceQuotaStore extends KubeObjectStore<ResourceQuota, ResourceQuotaApi> {
}
