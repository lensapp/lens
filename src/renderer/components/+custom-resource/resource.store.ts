/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeApi } from "../../../common/k8s-api/kube-api";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

/**
 * @deprecated This type is never used
 */
export class CRDResourceStore<K extends KubeObject> extends KubeObjectStore<K> {
  constructor(public readonly api:KubeApi<K>) {
    super();
  }
}
