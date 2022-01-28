/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Secret, SecretApi } from "../../../common/k8s-api/endpoints";

export class SecretStore extends KubeObjectStore<Secret> {
  constructor(public readonly api:SecretApi)  {
    super();
  }
}
