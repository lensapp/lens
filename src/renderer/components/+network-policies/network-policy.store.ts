/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { NetworkPolicy, NetworkPolicyApi } from "../../../common/k8s-api/endpoints/network-policy.api";
import { networkPolicyApi } from "../../../common/k8s-api/endpoints/network-policy.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy, NetworkPolicyApi> {
}

export const networkPolicyStore = new NetworkPolicyStore(networkPolicyApi);
apiManager.registerStore(networkPolicyStore);
