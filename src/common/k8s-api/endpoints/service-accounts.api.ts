/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { BaseKubeApiOptions, KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface ServiceAccount {
  secrets?: {
    name: string;
  }[];
  imagePullSecrets?: {
    name: string;
  }[];
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

/**
 * The api type for {@link ServiceAccount}'s
 */

export class ServiceAccountApi extends KubeApi<ServiceAccount> {
  constructor(params?: BaseKubeApiOptions) {
    super({
      ...(params ?? {}),
      objectConstructor: ServiceAccount,
    });
  }
}

/**
 * Only available within kubernetes cluster pages
 */
export const serviceAccountsApi = isClusterPageContext()
  ? new ServiceAccountApi()
  : undefined;
