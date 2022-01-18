/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { ResourceQuota, resourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class ResourceQuotasStore extends KubeObjectStore<ResourceQuota> {
  api = resourceQuotaApi;
}

export const resourceQuotaStore = new ResourceQuotasStore();
apiManager.registerStore(resourceQuotaStore);
