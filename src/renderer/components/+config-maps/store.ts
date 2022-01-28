/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ConfigMap, ConfigMapApi } from "../../../common/k8s-api/endpoints/configmap.api";

export class ConfigMapStore extends KubeObjectStore<ConfigMap> {
  constructor(public readonly api: ConfigMapApi) {
    super();
  }
}
