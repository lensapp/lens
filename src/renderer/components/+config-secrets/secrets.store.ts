/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Secret } from "../../../common/k8s-api/endpoints";
import { secretsApi } from "../../../common/k8s-api/endpoints";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class SecretsStore extends KubeObjectStore<Secret> {
  api = secretsApi;
}

export const secretsStore = new SecretsStore();
apiManager.registerStore(secretsStore);
