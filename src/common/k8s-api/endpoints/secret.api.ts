/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

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

export interface ISecretRef {
  key?: string;
  name: string;
}

export interface SecretReference {
  name: string;
  namespace?: string;
}

export interface SecretData extends KubeJsonApiData {
  type: SecretType;
  data?: Record<string, string>;
}

export class Secret extends KubeObject {
  static kind = "Secret";
  static namespaced = true;
  static apiBase = "/api/v1/secrets";

  declare type: SecretType;
  declare data: Record<string, string>;

  constructor(data: SecretData) {
    super(data);
    autoBind(this);

    this.data ??= {};
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }
}

let secretsApi: KubeApi<Secret>;

if (isClusterPageContext()) {
  secretsApi = new KubeApi({
    objectConstructor: Secret,
  });
}

export {
  secretsApi,
};
