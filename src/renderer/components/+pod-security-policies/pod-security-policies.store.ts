/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PodSecurityPolicy, PodSecurityPolicyApi } from "../../../common/k8s-api/endpoints";
import { podSecurityPolicyApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class PodSecurityPolicyStore extends KubeObjectStore<PodSecurityPolicy, PodSecurityPolicyApi> {
}

export const podSecurityPolicyStore = new PodSecurityPolicyStore(podSecurityPolicyApi);
apiManager.registerStore(podSecurityPolicyStore);
