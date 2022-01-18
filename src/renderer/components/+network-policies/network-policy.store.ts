/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { NetworkPolicy, networkPolicyApi } from "../../../common/k8s-api/endpoints/network-policy.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy> {
  api = networkPolicyApi;
}

export const networkPolicyStore = new NetworkPolicyStore();
apiManager.registerStore(networkPolicyStore);
