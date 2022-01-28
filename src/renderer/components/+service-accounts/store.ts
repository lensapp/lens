/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ServiceAccount, ServiceAccountApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export class ServiceAccountStore extends KubeObjectStore<ServiceAccount> {
  constructor(public readonly api:ServiceAccountApi) {
    super();
  }

  protected createItem = async (params: { name: string; namespace?: string }) => {
    await super.createItem(params);

    return this.api.get(params); // hackfix: load freshly created account, cause it doesn't have "secrets" field yet
  };
}
