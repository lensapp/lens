/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export interface SecretRef {
  name: string;
}

export interface ServiceAccount {
  secrets?: SecretRef[];
  imagePullSecrets?: SecretRef[];
}

export class ServiceAccount extends KubeObject {
  static kind = "ServiceAccount";
  static namespaced = true;
  static apiBase = "/api/v1/serviceaccounts";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getSecrets() {
    return this.secrets || [];
  }

  getImagePullSecrets() {
    return this.imagePullSecrets || [];
  }
}

export class ServiceAccountApi extends KubeApi<ServiceAccount> {
  constructor(args: SpecificApiOptions<ServiceAccount> = {}) {
    super({
      ...args,
      objectConstructor: ServiceAccount,
    });
  }
}
