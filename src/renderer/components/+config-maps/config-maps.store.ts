/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ConfigMap } from "../../../common/k8s-api/endpoints/configmap.api";
import { configMapApi } from "../../../common/k8s-api/endpoints/configmap.api";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class ConfigMapsStore extends KubeObjectStore<ConfigMap> {
  api = configMapApi;
}

export const configMapsStore = new ConfigMapsStore();
apiManager.registerStore(configMapsStore);
