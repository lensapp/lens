/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
