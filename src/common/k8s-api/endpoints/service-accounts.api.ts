/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, LocalObjectReference, ObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface ServiceAccountData extends KubeJsonApiData<KubeObjectMetadata<"namespace-scoped">, void, void> {
  automountServiceAccountToken?: boolean;
  imagePullSecrets?: LocalObjectReference[];
  secrets?: ObjectReference[];
}

export class ServiceAccount extends KubeObject<void, void, "namespace-scoped"> {
  static readonly kind = "ServiceAccount";
  static readonly namespaced = true;
  static readonly apiBase = "/api/v1/serviceaccounts";

  automountServiceAccountToken?: boolean;
  imagePullSecrets?: LocalObjectReference[];
  secrets?: ObjectReference[];

  constructor({
    automountServiceAccountToken,
    imagePullSecrets,
    secrets,
    ...rest
  }: ServiceAccountData) {
    super(rest);
    this.automountServiceAccountToken = automountServiceAccountToken;
    this.imagePullSecrets = imagePullSecrets;
    this.secrets = secrets;
  }

  getSecrets() {
    return this.secrets || [];
  }

  getImagePullSecrets() {
    return this.imagePullSecrets || [];
  }
}

export class ServiceAccountApi extends KubeApi<ServiceAccount, ServiceAccountData> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ServiceAccount,
    });
  }
}

export const serviceAccountApi = isClusterPageContext()
  ? new ServiceAccountApi()
  : undefined as never;
