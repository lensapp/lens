/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeApi } from "../kube-api";
import { KubeObjectStore } from "../kube-object.store";
import type { KubeObject } from "../kube-object";

export class CustomResourceStore<K extends KubeObject> extends KubeObjectStore<K, KubeApi<K>> {
  constructor(api: KubeApi<K>) {
    super(api);
  }
}
