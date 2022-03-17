/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { ServiceAccount, ServiceAccountApi, ServiceAccountData } from "../../../../common/k8s-api/endpoints";
import { serviceAccountApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../../utils";

export class ServiceAccountsStore extends KubeObjectStore<ServiceAccount, ServiceAccountApi, ServiceAccountData> {
  protected async createItem(params: { name: string; namespace?: string }) {
    await super.createItem(params);

    return this.api.get(params); // hackfix: load freshly created account, cause it doesn't have "secrets" field yet
  }
}

export const serviceAccountsStore = isClusterPageContext()
  ? new ServiceAccountsStore(serviceAccountApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(serviceAccountsStore);
}
