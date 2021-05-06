import { KubeObject } from "../kube-object";
import { KubeJsonApiData } from "../kube-json-api";
import { autoBind } from "../../utils";
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

export interface ISecretRef {
  key?: string;
  name: string;
}

export class Secret extends KubeObject {
  static kind = "Secret";
  static namespaced = true;
  static apiBase = "/api/v1/secrets";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  type: SecretType;
  data: {
    [prop: string]: string;
    token?: string;
  } = {};

  getKeys(): string[] {
    return Object.keys(this.data);
  }

  getToken() {
    return this.data.token;
  }
}

export const secretsApi = new KubeApi({
  objectConstructor: Secret,
});
