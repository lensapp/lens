/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PodSecurityPolicy, pspApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class PodSecurityPoliciesStore extends KubeObjectStore<PodSecurityPolicy> {
  api = pspApi;
}

export const podSecurityPoliciesStore = new PodSecurityPoliciesStore();
apiManager.registerStore(podSecurityPoliciesStore);
