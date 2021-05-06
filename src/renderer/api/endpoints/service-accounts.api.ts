import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { KubeJsonApiData } from "../kube-json-api";

export class ServiceAccount extends KubeObject {
  static kind = "ServiceAccount";
  static namespaced = true;
  static apiBase = "/api/v1/serviceaccounts";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  secrets?: {
    name: string;
  }[];
  imagePullSecrets?: {
    name: string;
  }[];

  getSecrets() {
    return this.secrets || [];
  }

  getImagePullSecrets() {
    return this.imagePullSecrets || [];
  }
}

export const serviceAccountsApi = new KubeApi<ServiceAccount>({
  objectConstructor: ServiceAccount,
});
