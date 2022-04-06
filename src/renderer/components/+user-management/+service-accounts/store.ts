/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiManager } from "../../../../common/k8s-api/api-manager";
import type { ServiceAccount } from "../../../../common/k8s-api/endpoints";
import { serviceAccountsApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../../utils";

export class ServiceAccountsStore extends KubeObjectStore<ServiceAccount> {
  api = serviceAccountsApi;

  constructor() {
    super();
    autoBind(this);
  }

  protected async createItem(params: { name: string; namespace?: string }) {
    await super.createItem(params);

    return this.api.get(params); // hackfix: load freshly created account, cause it doesn't have "secrets" field yet
  }
}

export const serviceAccountsStore = new ServiceAccountsStore();
apiManager.registerStore(serviceAccountsStore);
