/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ResourceQuota, ResourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { resourceQuotaApi } from "../../../common/k8s-api/endpoints/resource-quota.api";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class ResourceQuotaStore extends KubeObjectStore<ResourceQuota, ResourceQuotaApi> {
}

export const resourceQuotaStore = isClusterPageContext()
  ? new ResourceQuotaStore(resourceQuotaApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(resourceQuotaStore);
}
