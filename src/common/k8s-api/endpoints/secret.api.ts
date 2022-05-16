/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { autoBind } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";

export enum SecretType {
  Opaque = "Opaque",
  ServiceAccountToken = "kubernetes.io/service-account-token",
  Dockercfg = "kubernetes.io/dockercfg",
  DockerConfigJson = "kubernetes.io/dockerconfigjson",
  BasicAuth = "kubernetes.io/basic-auth",
  SSHAuth = "kubernetes.io/ssh-auth",
  TLS = "kubernetes.io/tls",
  BootstrapToken = "bootstrap.kubernetes.io/token",
}

export const reverseSecretTypeMap = {
  [SecretType.Opaque]: "Opaque",
  [SecretType.ServiceAccountToken]: "ServiceAccountToken",
  [SecretType.Dockercfg]: "Dockercfg",
  [SecretType.DockerConfigJson]: "DockerConfigJson",
  [SecretType.BasicAuth]: "BasicAuth",
  [SecretType.SSHAuth]: "SSHAuth",
  [SecretType.TLS]: "TLS",
  [SecretType.BootstrapToken]: "BootstrapToken",
};

export interface SecretReference {
  name: string;
  namespace?: string;
}

export interface SecretData extends KubeJsonApiData<KubeObjectMetadata<KubeObjectScope.Namespace>, void, void> {
  type: SecretType;
  data?: Partial<Record<string, string>>;
}

export class Secret extends KubeObject<void, void, KubeObjectScope.Namespace> {
  static readonly kind = "Secret";
  static readonly namespaced = true;
  static readonly apiBase = "/api/v1/secrets";

  type: SecretType;
  data: Partial<Record<string, string>>;

  constructor({ data = {}, type, ...rest }: SecretData) {
    super(rest);
    autoBind(this);

    this.data = data;
    this.type = type;
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }
}

export class SecretApi extends KubeApi<Secret, SecretData> {
  constructor(options: DerivedKubeApiOptions = {}) {
    super({
      ...options,
      objectConstructor: Secret,
    });
  }
}
