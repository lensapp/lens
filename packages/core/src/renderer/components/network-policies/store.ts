/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { NetworkPolicyApi } from "../../../common/k8s-api/endpoints/network-policy.api";
import type { NetworkPolicy } from "@k8slens/kube-object";

export class NetworkPolicyStore extends KubeObjectStore<NetworkPolicy, NetworkPolicyApi> {
}
